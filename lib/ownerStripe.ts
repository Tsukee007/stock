import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Un propriétaire ne peut louer que si son compte Stripe peut recevoir des transferts :
// sans cela, Stripe refuse le reversement de son loyer (alerte « reversement en échec »).

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Vérifie en direct chez Stripe et remet profiles.stripe_onboarding_complete à jour dans les deux sens
export async function isOwnerStripeReady(ownerId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('id', ownerId)
    .single()

  let ready = false
  if (profile?.stripe_account_id) {
    try {
      const account = await stripe.accounts.retrieve(profile.stripe_account_id)
      ready = !!account.details_submitted && account.capabilities?.transfers === 'active'
    } catch (err) {
      console.error('Compte Stripe du propriétaire ' + ownerId + ' illisible', err)
      return false
    }
  }

  if (profile && !!profile.stripe_onboarding_complete !== ready) {
    await supabase.from('profiles').update({ stripe_onboarding_complete: ready }).eq('id', ownerId)
  }
  return ready
}
