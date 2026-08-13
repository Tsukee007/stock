import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateQuittanceHtml(data: {
  reference: string
  date: string
  periode: string
  ownerName: string
  ownerAddress: string
  ownerPhone: string
  ownerEmail: string
  renterName: string
  renterAddress: string
  spaceTitle: string
  spaceAddress: string
  amount: number
  paymentMethod: string
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">
      
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 24px;">NESTOCK</h1>
        <p style="color: #64748b; margin: 5px 0 0; font-size: 12px;">nestock.pro</p>
        <h2 style="margin: 15px 0 0; font-size: 18px; color: #1e293b;">QUITTANCE DE LOYER</h2>
        <p style="margin: 5px 0 0; color: #64748b; font-size: 13px;">Réf. ${data.reference}</p>
      </div>

      <table style="width: 100%; margin-bottom: 25px;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 15px;">
            <div style="background: #f8fafc; border-radius: 8px; padding: 15px;">
              <p style="font-weight: bold; color: #2563eb; margin: 0 0 10px;">LE BAILLEUR</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>${data.ownerName}</strong></p>
              <p style="margin: 3px 0; font-size: 13px; color: #64748b;">${data.ownerAddress}</p>
              <p style="margin: 3px 0; font-size: 13px; color: #64748b;">${data.ownerPhone}</p>
              <p style="margin: 3px 0; font-size: 13px; color: #64748b;">${data.ownerEmail}</p>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 15px;">
            <div style="background: #f8fafc; border-radius: 8px; padding: 15px;">
              <p style="font-weight: bold; color: #2563eb; margin: 0 0 10px;">LE LOCATAIRE</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>${data.renterName}</strong></p>
              <p style="margin: 3px 0; font-size: 13px; color: #64748b;">${data.renterAddress}</p>
            </div>
          </td>
        </tr>
      </table>

      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 15px;">DÉTAILS DE LA LOCATION</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 40%;">Description :</td>
            <td style="padding: 6px 0; font-size: 13px;"><strong>Location d'un espace de stockage — ${data.spaceTitle}</strong></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Adresse du lieu :</td>
            <td style="padding: 6px 0; font-size: 13px;">${data.spaceAddress}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Période :</td>
            <td style="padding: 6px 0; font-size: 13px;">${data.periode}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Moyen de paiement :</td>
            <td style="padding: 6px 0; font-size: 13px;">${data.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Date de paiement :</td>
            <td style="padding: 6px 0; font-size: 13px;">${data.date}</td>
          </tr>
        </table>
      </div>

      <div style="background: #2563eb; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
        <p style="color: white; margin: 0; font-size: 14px;">MONTANT PAYÉ</p>
        <p style="color: white; margin: 5px 0 0; font-size: 32px; font-weight: bold;">${data.amount.toFixed(2)} €</p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          Quittance générée automatiquement par la plateforme Nestock — nestock.pro
        </p>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0;">
          Ce document atteste du paiement effectué et vaut quittance de loyer.
        </p>
      </div>

    </div>
  `
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    event = JSON.parse(body) as Stripe.Event
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { bookingId, contractId } = session.metadata || {}

    if (!bookingId) return NextResponse.json({ received: true })

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, spaces(title, address, city, surface_m2, type, price_month, owner_id)')
      .eq('id', bookingId)
      .single()

    if (!booking) return NextResponse.json({ received: true })

    const spaceData = booking.spaces as any

    await supabase.from('bookings').update({
      status: 'active',
      stripe_subscription_id: session.subscription as string
    }).eq('id', bookingId)

    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('full_name, address, city, postal_code, phone')
      .eq('id', spaceData.owner_id)
      .single()

    const { data: renterProfile } = await supabase
      .from('profiles')
      .select('full_name, address, city, postal_code, phone')
      .eq('id', booking.renter_id)
      .single()

    const amount = session.amount_total ? session.amount_total / 100 : spaceData.price_month

    const { data: invoice } = await supabase.from('invoices').insert({
      booking_id: bookingId,
      contract_id: contractId || null,
      owner_id: spaceData.owner_id,
      renter_id: booking.renter_id,
      amount,
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
        link: '/dashboard/bookings/' + bookingId
      },
      {
        user_id: spaceData.owner_id,
        type: 'payment',
        title: 'Paiement recu !',
        message: 'Le locataire a paye pour ' + spaceData.title + '. Location active !',
        link: '/dashboard'
      }
    ])

    const now = new Date()
    const periode = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const dateStr = now.toLocaleDateString('fr-FR')
    const reference = invoice?.reference || 'N/A'

    const ownerAddress = ownerProfile ? (ownerProfile.address || '') + ', ' + (ownerProfile.postal_code || '') + ' ' + (ownerProfile.city || '') : '—'
    const renterAddress = renterProfile ? (renterProfile.address || '') + ', ' + (renterProfile.postal_code || '') + ' ' + (renterProfile.city || '') : '—'

    const quittanceHtml = generateQuittanceHtml({
      reference,
      date: dateStr,
      periode,
      ownerName: ownerProfile?.full_name || '—',
      ownerAddress,
      ownerPhone: ownerProfile?.phone || '—',
      ownerEmail: '',
      renterName: renterProfile?.full_name || '—',
      renterAddress,
      spaceTitle: spaceData.title,
      spaceAddress: spaceData.address + ', ' + spaceData.city,
      amount,
      paymentMethod: 'Prelevement automatique Stripe'
    })

    const { data: renterUser } = await supabase.auth.admin.getUserById(booking.renter_id)
    const { data: ownerUser } = await supabase.auth.admin.getUserById(spaceData.owner_id)

    if (renterUser?.user?.email) {
      await sendEmail({
        to: renterUser.user.email,
        subject: 'Votre quittance de loyer — ' + reference,
        html: quittanceHtml
      })
    }

    if (ownerUser?.user?.email) {
      await sendEmail({
        to: ownerUser.user.email,
        subject: 'Paiement recu — Quittance ' + reference,
        html: quittanceHtml
      })
    }
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as any
    const subscriptionId = invoice.subscription as string

    if (!subscriptionId) return NextResponse.json({ received: true })

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, spaces(title, address, city, price_month, owner_id)')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!booking || invoice.billing_reason === 'subscription_create') {
      return NextResponse.json({ received: true })
    }

    const spaceData = booking.spaces as any
    const amount = invoice.amount_paid / 100

    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('full_name, address, city, postal_code, phone')
      .eq('id', spaceData.owner_id)
      .single()

    const { data: renterProfile } = await supabase
      .from('profiles')
      .select('full_name, address, city, postal_code, phone')
      .eq('id', booking.renter_id)
      .single()

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
        link: '/dashboard/bookings/' + booking.id
      },
      {
        user_id: spaceData.owner_id,
        type: 'payment',
        title: 'Loyer recu !',
        message: 'Vous avez recu ' + amount + 'EUR pour ' + spaceData.title + '.',
        link: '/dashboard'
      }
    ])

    const now = new Date()
    const periode = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const dateStr = now.toLocaleDateString('fr-FR')
    const reference = newInvoice?.reference || 'N/A'

    const ownerAddress = ownerProfile ? (ownerProfile.address || '') + ', ' + (ownerProfile.postal_code || '') + ' ' + (ownerProfile.city || '') : '—'
    const renterAddress = renterProfile ? (renterProfile.address || '') + ', ' + (renterProfile.postal_code || '') + ' ' + (renterProfile.city || '') : '—'

    const quittanceHtml = generateQuittanceHtml({
      reference,
      date: dateStr,
      periode,
      ownerName: ownerProfile?.full_name || '—',
      ownerAddress,
      ownerPhone: ownerProfile?.phone || '—',
      ownerEmail: '',
      renterName: renterProfile?.full_name || '—',
      renterAddress,
      spaceTitle: spaceData.title,
      spaceAddress: spaceData.address + ', ' + spaceData.city,
      amount,
      paymentMethod: 'Prelevement automatique Stripe'
    })

    const { data: renterUser } = await supabase.auth.admin.getUserById(booking.renter_id)
    const { data: ownerUser } = await supabase.auth.admin.getUserById(spaceData.owner_id)

    if (renterUser?.user?.email) {
      await sendEmail({
        to: renterUser.user.email,
        subject: 'Quittance de loyer mensuelle — ' + reference,
        html: quittanceHtml
      })
    }

    if (ownerUser?.user?.email) {
      await sendEmail({
        to: ownerUser.user.email,
        subject: 'Paiement mensuel recu — ' + reference,
        html: quittanceHtml
      })
    }
  }

  if (event.type === 'customer.subscription.deleted' ||
      (event.type === 'customer.subscription.updated' && (event.data.object as any).cancel_at_period_end === true)) {
    const subscription = event.data.object as any
    const subscriptionId = subscription.id

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, renter_id, space_id, status, ending_date')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (booking) {
      const { data: spaceData } = await supabase
        .from('spaces')
        .select('owner_id, title')
        .eq('id', booking.space_id)
        .single()

      // Cas 1 : la reservation etait deja en preavis (status 'ending') et l'annulation
      // programmee via cancel_at vient de se declencher a la date prevue.
      // Il s'agit du deroulement normal du preavis Nestock, pas d'une annulation surprise.
      // On calcule et rembourse le prorata des jours non utilises du dernier mois si besoin.
      if (event.type === 'customer.subscription.deleted' && booking.status === 'ending') {
        try {
          const invoices = await stripe.invoices.list({
            subscription: subscriptionId,
            status: 'paid',
            limit: 1,
          })
          const lastInvoice = invoices.data[0] as any

          if (lastInvoice && lastInvoice.period_start && lastInvoice.period_end && booking.ending_date) {
            const periodStart = lastInvoice.period_start
            const periodEnd = lastInvoice.period_end
            const endingDateUnix = Math.floor(new Date(booking.ending_date).getTime() / 1000)

            const totalDays = (periodEnd - periodStart) / 86400
            const usedDays = Math.max(0, Math.min(totalDays, (endingDateUnix - periodStart) / 86400))
            const unusedDays = totalDays - usedDays

            if (unusedDays > 0.5 && totalDays > 0) {
              const refundRatio = unusedDays / totalDays
              const refundAmount = Math.round(lastInvoice.amount_paid * refundRatio)
              const paymentIntentId = lastInvoice.payment_intent as string

              if (refundAmount > 0 && paymentIntentId) {
                await stripe.refunds.create({
                  payment_intent: paymentIntentId,
                  amount: refundAmount,
                })

                const refundAmountEur = (refundAmount / 100).toFixed(2)

                await supabase.from('notifications').insert({
                  user_id: booking.renter_id,
                  type: 'refund',
                  title: 'Remboursement au prorata',
                  message: 'Vous avez ete rembourse de ' + refundAmountEur + ' EUR correspondant aux jours non utilises de votre dernier mois pour ' + (spaceData?.title || 'votre location') + '.',
                  link: '/dashboard/bookings/' + booking.id
                })

                const { data: renterUser } = await supabase.auth.admin.getUserById(booking.renter_id)
                if (renterUser?.user?.email) {
                  await sendEmail({
                    to: renterUser.user.email,
                    subject: 'Remboursement au prorata — ' + (spaceData?.title || 'Nestock'),
                    html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>Votre location pour <strong>' + (spaceData?.title || '') + '</strong> etant terminee avant la fin de votre periode de facturation, vous avez ete rembourse au prorata des jours non utilises.</p><p style="font-size: 24px; font-weight: bold; color: #16a34a;">' + refundAmountEur + ' EUR</p><p>Ce montant sera credite sur votre moyen de paiement sous quelques jours ouvres.</p></div>'
                  })
                }
              }
            }
          }
        } catch (refundErr) {
          console.error('Erreur calcul/remboursement prorata pour booking ' + booking.id + ':', refundErr)
        }
        // Le cron end-bookings se charge de faire passer le statut a 'ended' une fois
        // ending_date atteinte — pas besoin de le faire ici.
        return NextResponse.json({ received: true })
      }

      // Cas 2 : annulation surprise, pas encore de preavis en cours (ex: le locataire
      // annule directement depuis son espace client Stripe plutot que via Nestock).
      // Comportement existant : on convertit en preavis standard de 15 jours.
      const endingDate = new Date()
      endingDate.setDate(endingDate.getDate() + 15)

      await supabase.from('bookings').update({
        status: 'ending',
        ending_date: endingDate.toISOString(),
        notice_initiated_by: 'renter'
      }).eq('id', booking.id)

      await supabase.from('notifications').insert({
        user_id: booking.renter_id,
        type: 'subscription_cancelled',
        title: 'Abonnement annule',
        message: 'Votre abonnement a ete annule via Stripe. Un preavis de 15 jours a ete initie, fin le ' + endingDate.toLocaleDateString('fr-FR') + '.',
        link: '/dashboard/bookings/' + booking.id
      })

      const { data: renterUser } = await supabase.auth.admin.getUserById(booking.renter_id)
      if (renterUser?.user?.email) {
        await sendEmail({
          to: renterUser.user.email,
          subject: 'Annulation abonnement — ' + (spaceData?.title || 'Nestock'),
          html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>Votre abonnement Stripe pour <strong>' + (spaceData?.title || 'votre location') + '</strong> a ete annule.</p><p>Un preavis de 15 jours a ete automatiquement initie. La location se terminera le <strong>' + endingDate.toLocaleDateString('fr-FR') + '</strong>.</p><a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Voir ma location</a></div>'
        })
      }

      if (spaceData) {
        await supabase.from('notifications').insert({
          user_id: spaceData.owner_id,
          type: 'subscription_cancelled',
          title: 'Annulation locataire',
          message: 'Le locataire a annule son abonnement Stripe pour ' + spaceData.title + '. La location passe en preavis, fin le ' + endingDate.toLocaleDateString('fr-FR') + '.',
          link: '/dashboard'
        })

        const { data: ownerUser } = await supabase.auth.admin.getUserById(spaceData.owner_id)
        if (ownerUser?.user?.email) {
          await sendEmail({
            to: ownerUser.user.email,
            subject: 'Annulation abonnement — ' + spaceData.title,
            html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>Le locataire a annule son abonnement Stripe pour <strong>' + spaceData.title + '</strong>.</p><p>La location passe en statut <strong>Préavis</strong> et se terminera le <strong>' + endingDate.toLocaleDateString('fr-FR') + '</strong>.</p></div>'
          })
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}