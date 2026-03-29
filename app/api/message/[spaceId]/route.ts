import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const { spaceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
  }

  // Chercher une conversation existante sans créer de réservation
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('space_id', spaceId)
    .eq('renter_id', user.id)
    .single()

  if (existing) {
    return NextResponse.redirect(
      new URL(`/messages?booking_id=${existing.id}`, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
    )
  }

  // Créer une réservation "message only" avec statut pending
  const { data: space } = await supabase
    .from('spaces')
    .select('price_month')
    .eq('id', spaceId)
    .single()

  const { data: booking } = await supabase
    .from('bookings')
    .insert({
      space_id: spaceId,
      renter_id: user.id,
      start_date: new Date().toISOString().split('T')[0],
      price_month: space?.price_month ?? 0,
      status: 'message_only'
    })
    .select('id')
    .single()

  return NextResponse.redirect(
    new URL(`/messages?booking_id=${booking?.id}`, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  )
}