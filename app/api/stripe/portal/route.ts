import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('stripe_subscription_id')
    .eq('renter_id', user.id)
    .in('status', ['active', 'confirmed', 'ending'])
    .not('stripe_subscription_id', 'is', null)
    .limit(1)
    .single()

  if (!booking?.stripe_subscription_id) {
    return NextResponse.redirect(new URL('/profile', process.env.NEXT_PUBLIC_SITE_URL!))
  }

  const subscription = await stripe.subscriptions.retrieve(booking.stripe_subscription_id)
  const customerId = subscription.customer as string

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: process.env.NEXT_PUBLIC_SITE_URL + '/profile',
  })

  return NextResponse.redirect(session.url)
}
