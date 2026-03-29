import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { bookingId } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, spaces(title, price_month)')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })

  const space = booking.spaces as any
  const commission = Math.round(space.price_month * 0.10 * 100) // 10% en centimes
  const total = Math.round(space.price_month * 1.10 * 100) // total en centimes

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: space.title,
            description: `Location d'espace de stockage - 1 mois`,
          },
          unit_amount: total,
        },
        quantity: 1,
      }
    ],
    metadata: {
      bookingId,
      userId: user.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}