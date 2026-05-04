import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function invoiceHtml({
  renterName,
  ownerName,
  spaceTitle,
  spaceAddress,
  spaceCity,
  loyer_ht,
  loyer_ttc,
  reference,
  date,
}: {
  renterName: string
  ownerName: string
  spaceTitle: string
  spaceAddress: string
  spaceCity: string
  loyer_ht: number
  loyer_ttc: number
  reference: string
  date: string
}) {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
  <div style="background: #2563eb; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Nestock</h1>
    <p style="color: #bfdbfe; margin: 4px 0 0;">Confirmation de location</p>
  </div>
  <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="color: #16a34a; font-weight: bold; font-size: 18px;">✅ Votre location est maintenant active !</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 0; color: #6b7280;">Référence</td>
        <td style="padding: 8px 0; font-weight: bold;">${reference}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 0; color: #6b7280;">Espace</td>
        <td style="padding: 8px 0;">${spaceTitle}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 0; color: #6b7280;">Adresse</td>
        <td style="padding: 8px 0;">${spaceAddress}, ${spaceCity}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 0; color: #6b7280;">Locataire</td>
        <td style="padding: 8px 0;">${renterName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 0; color: #6b7280;">Propriétaire</td>
        <td style="padding: 8px 0;">${ownerName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 0; color: #6b7280;">Loyer HT</td>
        <td style="padding: 8px 0;">${loyer_ht.toFixed(2)} €</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 0; color: #6b7280;">Frais de service (10%)</td>
        <td style="padding: 8px 0;">${(loyer_ttc - loyer_ht).toFixed(2)} €</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Total TTC</td>
        <td style="padding: 8px 0; font-weight: bold; color: #2563eb;">${loyer_ttc.toFixed(2)} €/mois</td>
      </tr>
    </table>
    <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">Date d'activation : ${date}</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
      style="display: inline-block; margin-top: 20px; background: #2563eb; color: white;
             padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
      Voir mon tableau de bord
    </a>
  </div>
  <div style="background: #f9fafb; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      Nestock — nestock.tsukee.fr · Ce document tient lieu de reçu de paiement
    </p>
  </div>
</div>`
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId

    if (!bookingId) return NextResponse.json({ received: true })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase
      .from('bookings')
      .update({
        status: 'active',
        stripe_payment_intent_id: (session.payment_intent ?? session.subscription) as string,
      })
      .eq('id', bookingId)

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, spaces(title, address, city, price_month), contracts(reference, loyer_ht, loyer_ttc)')
      .eq('id', bookingId)
      .single()

    if (!booking) return NextResponse.json({ received: true })

    const space = booking.spaces as any
    const contract = Array.isArray(booking.contracts) ? booking.contracts[0] : booking.contracts as any

    const { data: renterAuth } = await supabase.auth.admin.getUserById(booking.renter_id)
    const { data: ownerAuth } = await supabase.auth.admin.getUserById(booking.owner_id)
    const { data: renterProfile } = await supabase.from('profiles').select('full_name').eq('id', booking.renter_id).single()
    const { data: ownerProfile } = await supabase.from('profiles').select('full_name').eq('id', booking.owner_id).single()

    const renterEmail = renterAuth?.user?.email
    const ownerEmail = ownerAuth?.user?.email
    const renterName = (renterProfile as any)?.full_name ?? 'Locataire'
    const ownerName = (ownerProfile as any)?.full_name ?? 'Propriétaire'
    const reference = contract?.reference ?? bookingId.slice(0, 8).toUpperCase()
    const loyer_ht = contract?.loyer_ht ?? space?.price_month ?? 0
    const loyer_ttc = contract?.loyer_ttc ?? Math.round(loyer_ht * 1.10 * 100) / 100
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

    const html = invoiceHtml({
      renterName,
      ownerName,
      spaceTitle: space?.title ?? '',
      spaceAddress: space?.address ?? '',
      spaceCity: space?.city ?? '',
      loyer_ht,
      loyer_ttc,
      reference,
      date,
    })

    await Promise.all([
      supabase.from('notifications').insert({
        user_id: booking.renter_id,
        type: 'booking',
        title: 'Location active !',
        message: `Votre paiement a été confirmé. La location de "${space?.title}" est maintenant active.`,
        link: '/dashboard',
      }),
      supabase.from('notifications').insert({
        user_id: booking.owner_id,
        type: 'booking',
        title: 'Paiement reçu !',
        message: `Le paiement pour "${space?.title}" a été validé. La location est active.`,
        link: '/dashboard',
      }),
      renterEmail && sendEmail({
        to: renterEmail,
        subject: `✅ Location active — ${space?.title ?? 'votre espace'}`,
        html,
      }),
      ownerEmail && sendEmail({
        to: ownerEmail,
        subject: `💰 Paiement reçu — ${space?.title ?? 'votre espace'}`,
        html,
      }),
    ])
  }

  return NextResponse.json({ received: true })
}
