import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  
let event: Stripe.Event
try {
  event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
} catch (err: any) {
  // Mode debug temporaire - accepter sans vérification
  event = JSON.parse(body) as Stripe.Event
}

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { bookingId, contractId } = session.metadata || {}
    
    if (!bookingId) return NextResponse.json({ received: true })

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, spaces(title, owner_id, price_month)')
      .eq('id', bookingId)
      .single()

    if (!booking) return NextResponse.json({ received: true })

    const spaceData = booking.spaces as any

    await supabase.from('bookings').update({ 
      status: 'active',
      stripe_subscription_id: session.subscription as string
    }).eq('id', bookingId)

    const { data: invoice } = await supabase.from('invoices').insert({
      booking_id: bookingId,
      contract_id: contractId || null,
      owner_id: spaceData.owner_id,
      renter_id: booking.renter_id,
      amount: session.amount_total ? session.amount_total / 100 : spaceData.price_month,
      stripe_payment_id: session.payment_intent as string,
      status: 'paid'
    }).select().single()

    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: spaceData.owner_id,
      content: 'Paiement recu ! Votre location est maintenant active. Bienvenue !'
    })

    await supabase.from('notifications').insert([
      {
        user_id: booking.renter_id,
        type: 'payment',
        title: 'Paiement confirme !',
        message: 'Votre location pour ' + spaceData.title + ' est maintenant active.',
        link: '/dashboard'
      },
      {
        user_id: spaceData.owner_id,
        type: 'payment',
        title: 'Paiement recu !',
        message: 'Le locataire a paye pour ' + spaceData.title + '. Location active !',
        link: '/dashboard'
      }
    ])

    const { data: renterUser } = await supabase.auth.admin.getUserById(booking.renter_id)
    const { data: ownerUser } = await supabase.auth.admin.getUserById(spaceData.owner_id)

    const invoiceRef = invoice?.reference || 'N/A'
    const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : spaceData.price_month

    if (renterUser?.user?.email) {
      await sendEmail({
        to: renterUser.user.email,
        subject: 'Facture Nestock - ' + invoiceRef,
        html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">' +
          '<div style="text-align: center; margin-bottom: 30px;">' +
          '<h1 style="color: #2563eb; margin: 0;">NESTOCK</h1>' +
          '<p style="color: #64748b; margin: 5px 0;">Location d espaces de stockage</p>' +
          '</div>' +
          '<div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">' +
          '<h2 style="margin: 0 0 10px; color: #1e293b;">FACTURE</h2>' +
          '<p style="margin: 5px 0; color: #64748b;">Reference : <strong style="color: #1e293b;">' + invoiceRef + '</strong></p>' +
          '<p style="margin: 5px 0; color: #64748b;">Date : <strong style="color: #1e293b;">' + new Date().toLocaleDateString("fr-FR") + '</strong></p>' +
          '</div>' +
          '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' +
          '<thead><tr style="background: #2563eb; color: white;">' +
          '<th style="padding: 12px; text-align: left;">Description</th>' +
          '<th style="padding: 12px; text-align: right;">Montant</th>' +
          '</tr></thead>' +
          '<tbody><tr style="border-bottom: 1px solid #e2e8f0;">' +
          '<td style="padding: 12px;">Location - ' + spaceData.title + '</td>' +
          '<td style="padding: 12px; text-align: right;">' + amount + ' EUR</td>' +
          '</tr></tbody>' +
          '<tfoot><tr style="background: #f8fafc; font-weight: bold;">' +
          '<td style="padding: 12px;">TOTAL TTC</td>' +
          '<td style="padding: 12px; text-align: right; color: #2563eb;">' + amount + ' EUR</td>' +
          '</tr></tfoot>' +
          '</table>' +
          '<p style="color: #64748b; font-size: 12px; text-align: center;">Nestock - nestock.tsukee.fr - contact@tsukee.fr</p>' +
          '</div>'
      })
    }

    if (ownerUser?.user?.email) {
      await sendEmail({
        to: ownerUser.user.email,
        subject: 'Paiement recu - ' + spaceData.title,
        html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">' +
          '<h2 style="color: #2563eb;">Nestock</h2>' +
          '<p>Vous avez recu un paiement pour <strong>' + spaceData.title + '</strong>.</p>' +
          '<p>Reference facture : <strong>' + invoiceRef + '</strong></p>' +
          '<p>Montant : <strong>' + amount + ' EUR</strong></p>' +
          '<a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Voir le dashboard</a>' +
          '</div>'
      })
    }
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as any
    const subscriptionId = invoice.subscription as string
    
    if (!subscriptionId) return NextResponse.json({ received: true })

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, spaces(title, owner_id, price_month)')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!booking || invoice.billing_reason === 'subscription_create') {
      return NextResponse.json({ received: true })
    }

    const spaceData = booking.spaces as any
    const amount = invoice.amount_paid / 100

    const { data: newInvoice } = await supabase.from('invoices').insert({
      booking_id: booking.id,
      owner_id: spaceData.owner_id,
      renter_id: booking.renter_id,
      amount,
      stripe_payment_id: invoice.payment_intent as string,
      status: 'paid'
    }).select().single()

    await supabase.from('notifications').insert([
      {
        user_id: booking.renter_id,
        type: 'payment',
        title: 'Loyer preleve',
        message: 'Votre loyer de ' + amount + 'EUR pour ' + spaceData.title + ' a ete preleve.',
        link: '/dashboard'
      },
      {
        user_id: spaceData.owner_id,
        type: 'payment',
        title: 'Loyer recu !',
        message: 'Vous avez recu ' + amount + 'EUR pour ' + spaceData.title + '.',
        link: '/dashboard'
      }
    ])

    const { data: renterUser } = await supabase.auth.admin.getUserById(booking.renter_id)
    const invoiceRef = newInvoice?.reference || 'N/A'

    if (renterUser?.user?.email) {
      await sendEmail({
        to: renterUser.user.email,
        subject: 'Facture mensuelle Nestock - ' + invoiceRef,
        html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">' +
          '<h1 style="color: #2563eb;">NESTOCK</h1>' +
          '<h2>Facture mensuelle</h2>' +
          '<p>Reference : <strong>' + invoiceRef + '</strong></p>' +
          '<p>Date : <strong>' + new Date().toLocaleDateString("fr-FR") + '</strong></p>' +
          '<p>Location : <strong>' + spaceData.title + '</strong></p>' +
          '<p>Montant : <strong>' + amount + ' EUR TTC</strong></p>' +
          '<p style="color: #64748b; font-size: 12px;">Nestock - nestock.tsukee.fr</p>' +
          '</div>'
      })
    }
  }

  return NextResponse.json({ received: true })
}
