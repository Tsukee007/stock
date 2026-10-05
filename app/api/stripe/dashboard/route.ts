import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

// Bouton "compte Stripe" : non connecte -> /login, compte Stripe incomplet -> /stripe/connect (creation),
// compte complet -> lien de connexion unique vers le tableau de bord Stripe Express
export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL!
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', site))

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_account_id) return NextResponse.redirect(new URL('/stripe/connect', site))

  const account = await stripe.accounts.retrieve(profile.stripe_account_id)
  if (!account.details_submitted) return NextResponse.redirect(new URL('/stripe/connect', site))

  const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id)
  return NextResponse.redirect(loginLink.url)
}
