import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createNotification } from '@/lib/notifications'
import { sendEmail } from '@/lib/mailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const today = new Date().toISOString()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, renter_id, stripe_subscription_id, ending_date, spaces(id, title, owner_id)')
    .eq('status', 'ending')
    .lte('ending_date', today)

  if (error) {
    console.error('Erreur recuperation bookings a terminer:', error)
    return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
  }

  const results: { bookingId: string; status: string; error?: string }[] = []

  for (const booking of bookings ?? []) {
    try {
      const space = Array.isArray(booking.spaces) ? booking.spaces[0] : booking.spaces
      const ownerId = space?.owner_id
      const spaceTitle = space?.title ?? 'votre location'

      // 1. Annuler la subscription Stripe si elle existe
      if (booking.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(booking.stripe_subscription_id)
        } catch (stripeErr) {
          console.error(`Erreur annulation Stripe pour booking ${booking.id}:`, stripeErr)
        }
      }

      // 2. Passer le statut a "ended"
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'ended' })
        .eq('id', booking.id)

      if (updateError) throw updateError

      // 3. Recuperer les emails des deux parties
      const [{ data: renterData }, { data: ownerData }] = await Promise.all([
        supabase.auth.admin.getUserById(booking.renter_id),
        ownerId ? supabase.auth.admin.getUserById(ownerId) : Promise.resolve({ data: null }),
      ])
      const renterEmail = renterData?.user?.email
      const ownerEmail = ownerData?.user?.email

      const bookingLink = `/dashboard/bookings/${booking.id}`

      // 4. Notifications in-app
      await createNotification({
        userId: booking.renter_id,
        type: 'booking_ended',
        title: 'Location terminee',
        message: `Votre location "${spaceTitle}" est officiellement terminee.`,
        link: bookingLink,
      })
      if (ownerId) {
        await createNotification({
          userId: ownerId,
          type: 'booking_ended',
          title: 'Location terminee',
          message: `La location de votre annonce "${spaceTitle}" est officiellement terminee.`,
          link: bookingLink,
        })
      }

      // 5. Emails
      if (renterEmail) {
        await sendEmail({
          to: renterEmail,
          subject: 'Votre location Nestock est terminee',
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #111827;">Location terminee</h2>
              <p style="color: #6b7280;">Le preavis de 15 jours pour "${spaceTitle}" est arrive a son terme. Votre location est desormais officiellement close et le prelevement automatique a ete annule.</p>
              <p style="color: #9ca3af; font-size: 13px;">Nestock — contact@nestock.pro</p>
            </div>
          `,
        }).catch(e => console.error('Erreur email locataire:', e))
      }
      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: 'Une location de votre annonce est terminee',
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #111827;">Location terminee</h2>
              <p style="color: #6b7280;">Le preavis de 15 jours pour votre annonce "${spaceTitle}" est arrive a son terme. La location est desormais officiellement close et le prelevement automatique a ete annule. Votre annonce est de nouveau disponible.</p>
              <p style="color: #9ca3af; font-size: 13px;">Nestock — contact@nestock.pro</p>
            </div>
          `,
        }).catch(e => console.error('Erreur email proprietaire:', e))
      }

      results.push({ bookingId: booking.id, status: 'ended' })
    } catch (err) {
      console.error(`Erreur traitement booking ${booking.id}:`, err)
      results.push({ bookingId: booking.id, status: 'error', error: String(err) })
    }
  }

  return NextResponse.json({ processed: results.length, results })
}
