import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'

// Reversement au propriétaire : le locataire paie Nestock, puis Nestock transfère au propriétaire
// exactement le loyer qu'il a fixé (bookings.price_month). Nestock garde la commission de 10 %
// et les frais Stripe ajoutés au prix payé par le locataire.
// Le transfert est rattaché au paiement (source_transaction) : l'argent n'arrive chez le
// propriétaire qu'une fois le paiement du locataire disponible sur le compte Nestock.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_EMAIL = 'contact@nestock.pro'

function transferGroup(bookingId: string) {
  return 'booking_' + bookingId
}

async function alertAdmin(subject: string, details: string) {
  console.error('Reversement propriétaire : ' + subject + ' — ' + details)
  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: 'Nestock — ' + subject,
      html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #1D4ED8;">Nestock — à traiter</h2><p>' + details + '</p><p>Vérifiez dans le Dashboard Stripe (Connect → Transferts) et faites le reversement à la main si besoin.</p></div>'
    })
  } catch (err) {
    console.error('Reversement propriétaire : e-mail d\'alerte non envoyé', err)
  }
}

export async function transferOwnerShare({ bookingId, paymentIntentId }: {
  bookingId: string
  paymentIntentId: string | null
}) {
  try {
    if (!paymentIntentId) {
      await alertAdmin('reversement non fait', 'Paiement introuvable pour la location ' + bookingId + ' : le propriétaire n\'a pas été payé.')
      return
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, price_month, spaces(title, price_month, price_ttc, owner_id)')
      .eq('id', bookingId)
      .single()
    const space = booking?.spaces as any
    if (!booking || !space) {
      await alertAdmin('reversement non fait', 'Location ' + bookingId + ' introuvable (paiement ' + paymentIntentId + ').')
      return
    }

    const { data: owner } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', space.owner_id)
      .single()
    if (!owner?.stripe_account_id) {
      await alertAdmin('reversement non fait', 'Le propriétaire de « ' + space.title + ' » (location ' + bookingId + ') n\'a pas de compte Stripe : paiement ' + paymentIntentId + ' encaissé, rien reversé.')
      return
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const chargeId = typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : paymentIntent.latest_charge?.id
    if (!chargeId) {
      await alertAdmin('reversement non fait', 'Aucun débit trouvé pour le paiement ' + paymentIntentId + ' (location ' + bookingId + ').')
      return
    }

    // Loyer figé à la réservation. Le premier paiement ne couvre que les jours restants du mois
    // (prélèvement le 1er) : le propriétaire reçoit alors la même proportion de son loyer.
    const { data: contract } = await supabase
      .from('contracts')
      .select('loyer_ttc')
      .eq('booking_id', bookingId)
      .maybeSingle()
    const fullMonth = Math.round(Number(contract?.loyer_ttc ?? space.price_ttc) * 100)
    const paidShare = fullMonth > 0 ? Math.min(1, paymentIntent.amount_received / fullMonth) : 1
    const ownerShare = Math.min(
      Math.round(Number(booking.price_month ?? space.price_month) * 100 * paidShare),
      paymentIntent.amount_received
    )
    if (!(ownerShare > 0)) {
      await alertAdmin('reversement non fait', 'Montant à reverser nul ou invalide pour la location ' + bookingId + ' (paiement ' + paymentIntentId + ').')
      return
    }

    await stripe.transfers.create({
      amount: ownerShare,
      currency: 'eur',
      destination: owner.stripe_account_id,
      source_transaction: chargeId,
      transfer_group: transferGroup(bookingId),
      description: 'Loyer — ' + space.title,
      metadata: { bookingId, paymentIntentId }
    }, {
      // Stripe peut renvoyer le même événement : un seul transfert par paiement
      idempotencyKey: 'owner-share-' + paymentIntentId
    })
  } catch (err: any) {
    await alertAdmin('reversement en échec', 'Location ' + bookingId + ', paiement ' + paymentIntentId + ' : ' + (err?.message || String(err)))
  }
}

// Remboursement au prorata : on reprend au propriétaire la même proportion de sa part
export async function reverseOwnerShare({ bookingId, paymentIntentId, ratio }: {
  bookingId: string
  paymentIntentId: string
  ratio: number
}) {
  try {
    const transfers = await stripe.transfers.list({ transfer_group: transferGroup(bookingId), limit: 100 })
    const transfer = transfers.data.find(t => t.metadata?.paymentIntentId === paymentIntentId)
    if (!transfer) {
      await alertAdmin('reprise au propriétaire non faite', 'Aucun transfert trouvé pour le paiement ' + paymentIntentId + ' (location ' + bookingId + ') : le locataire a été remboursé, la part du propriétaire n\'a pas été reprise.')
      return
    }

    const amount = Math.min(Math.round(transfer.amount * ratio), transfer.amount - transfer.amount_reversed)
    if (amount <= 0) return

    await stripe.transfers.createReversal(transfer.id, {
      amount,
      metadata: { bookingId, paymentIntentId, motif: 'remboursement au prorata' }
    }, {
      idempotencyKey: 'owner-share-reversal-' + paymentIntentId
    })
  } catch (err: any) {
    await alertAdmin('reprise au propriétaire en échec', 'Location ' + bookingId + ', paiement ' + paymentIntentId + ' : ' + (err?.message || String(err)))
  }
}
