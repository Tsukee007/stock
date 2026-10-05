import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

// Bouton "Accéder à mon compte Stripe" : amène toujours l'utilisateur sur une page Stripe
// - non connecté à Nestock -> /login (message + retour automatique ici après connexion)
// - pas de compte Stripe ou inscription incomplète -> formulaire Stripe de création (compte créé si besoin)
// - compte complet -> tableau de bord Stripe Express (lien de connexion unique, sans saisie de mail)
export async function GET(req: Request) {
  // Redirections sur le domaine de la requete (cookies de session lies au domaine)
  const site = req.url
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login?raison=stripe&next=/api/stripe/dashboard', site))

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  let accountId = profile?.stripe_account_id

  if (accountId) {
    const account = await stripe.accounts.retrieve(accountId)
    if (account.details_submitted) {
      const loginLink = await stripe.accounts.createLoginLink(accountId)
      return NextResponse.redirect(loginLink.url)
    }
  } else {
    // Même création de compte que POST /api/stripe/connect
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual',
      metadata: { userId: user.id }
    })
    accountId = account.id
    await supabase.from('profiles').update({ stripe_account_id: accountId }).eq('id', user.id)
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: new URL('/stripe/connect?refresh=true', site).toString(),
    return_url: new URL('/stripe/connect?success=true', site).toString(),
    type: 'account_onboarding'
  })
  return NextResponse.redirect(accountLink.url)
}
