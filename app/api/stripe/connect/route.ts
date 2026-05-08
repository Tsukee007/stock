import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const body = await req.json().catch(() => ({}))
  const spaceId = body.spaceId || ''
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_onboarding_complete, full_name')
    .eq('id', user.id)
    .single()

  let accountId = profile?.stripe_account_id

  if (!accountId) {
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
    await supabase.from('profiles').update({
      stripe_account_id: accountId
    }).eq('id', user.id)
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: process.env.NEXT_PUBLIC_SITE_URL + '/stripe/connect?refresh=true&space_id=' + (spaceId || ''),
    return_url: process.env.NEXT_PUBLIC_SITE_URL + '/stripe/connect?success=true&space_id=' + (spaceId || ''),
    type: 'account_onboarding'
  })

  return NextResponse.json({ url: accountLink.url })
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ connected: false })
  }

  const account = await stripe.accounts.retrieve(profile.stripe_account_id)
  const isComplete = account.details_submitted && account.charges_enabled

  if (isComplete && !profile.stripe_onboarding_complete) {
    await supabase.from('profiles').update({
      stripe_onboarding_complete: true
    }).eq('id', user.id)
  }

  return NextResponse.json({ 
    connected: isComplete,
    accountId: profile.stripe_account_id
  })
}
