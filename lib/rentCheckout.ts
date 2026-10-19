import Stripe from 'stripe'
import { nextBillingDate } from '@/lib/billing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

// Page de paiement Stripe de l'abonnement mensuel du locataire.
// Prélèvement le 1er de chaque mois : le premier paiement couvre seulement les jours restants du mois en cours.
// Le webhook (checkout.session.completed) active la réservation grâce aux métadonnées.
export async function createRentCheckout({ bookingId, contractId, title, priceTtc, priceMonth }: {
  bookingId: string
  contractId: string
  title: string
  priceTtc: number | null
  priceMonth: number
}) {
  const priceInCents = Math.round((priceTtc ?? priceMonth * 1.10) * 100)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Location - ' + title,
          description: 'Abonnement mensuel Nestock'
        },
        unit_amount: priceInCents,
        recurring: { interval: 'month' }
      },
      quantity: 1
    }],
    success_url: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard?payment=success',
    cancel_url: process.env.NEXT_PUBLIC_SITE_URL + '/contracts/' + bookingId + '?payment=cancelled',
    metadata: { bookingId, contractId },
    subscription_data: {
      billing_cycle_anchor: Math.floor(nextBillingDate().getTime() / 1000),
      proration_behavior: 'create_prorations',
      metadata: { bookingId, contractId }
    }
  })

  return session.url
}
