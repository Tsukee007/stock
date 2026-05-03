import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: Request) {
  const { contractId, bookingId, signatureName, birthDate, phone, email, isOwner } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const now = new Date().toISOString()

  const { data: contract } = await supabase
    .from('contracts')
    .select('*, spaces(title, price_month)')
    .eq('id', contractId)
    .single()

  if (!contract) return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 })

  const spaceData = contract.spaces as any
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (isOwner) {
    await supabase.from('contracts').update({
      owner_signed: true,
      owner_signed_at: now,
      owner_signature_name: signatureName,
      owner_birth_date: birthDate,
      owner_phone: phone,
      owner_email: email,
      status: 'owner_signed'
    }).eq('id', contractId)

    const { data: renterAuth } = await adminClient.auth.admin.getUserById(contract.renter_id)
    const renterEmail = renterAuth?.user?.email

    await supabase.from('notifications').insert({
      user_id: contract.renter_id,
      type: 'contract',
      title: 'Contrat pret a signer !',
      message: 'Le proprietaire a signe le contrat pour ' + spaceData.title + '. A votre tour !',
      link: '/contracts/' + bookingId
    })

    if (renterEmail) {
      await sendEmail({
        to: renterEmail,
        subject: 'Votre contrat Nestock est pret a signer',
        html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>Le proprietaire a signe le contrat pour <strong>' + spaceData.title + '</strong>.</p><p>Il ne reste plus qu a apposer votre signature pour finaliser la location !</p><a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/contracts/' + bookingId + '" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Signer le contrat</a></div>'
      })
    }

    return NextResponse.json({ success: true })

  } else {
    await supabase.from('contracts').update({
      renter_signed: true,
      renter_signed_at: now,
      renter_signature_name: signatureName,
      renter_birth_date: birthDate,
      renter_phone: phone,
      renter_email: email,
      status: 'fully_signed'
    }).eq('id', contractId)

    await supabase.from('bookings').update({ status: 'awaiting_signature' }).eq('id', bookingId)

    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: user.id,
      content: 'Le contrat a ete signe par les deux parties. En attente de validation du paiement.'
    })

    await supabase.from('notifications').insert({
      user_id: contract.owner_id,
      type: 'contract',
      title: 'Contrat signe !',
      message: 'Le locataire a signe le contrat pour ' + spaceData.title + '. En attente du paiement.',
      link: '/dashboard'
    })

    const { data: ownerAuth } = await adminClient.auth.admin.getUserById(contract.owner_id)
    const ownerEmail = ownerAuth?.user?.email

    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: 'Contrat signe - En attente du paiement',
        html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>Le contrat pour <strong>' + spaceData.title + '</strong> a ete signe par les deux parties.</p><p>La location sera active apres validation du paiement mensuel.</p><a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Voir le dashboard</a></div>'
      })
    }

    const priceInCents = Math.round(spaceData.price_month * 1.10 * 100)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Location - ' + spaceData.title,
            description: 'Abonnement mensuel Nestock'
          },
          unit_amount: priceInCents,
          recurring: { interval: 'month' }
        },
        quantity: 1
      }],
      success_url: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard?payment=success',
      cancel_url: process.env.NEXT_PUBLIC_SITE_URL + '/contracts/' + bookingId + '?payment=cancelled',
      metadata: { bookingId, contractId }
    })

    return NextResponse.json({ success: true, checkoutUrl: session.url })
  }
}
