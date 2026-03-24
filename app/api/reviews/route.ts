import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  console.log('Reviews route appelée')
  
  const body = await req.json()
  console.log('Body:', body)
  
  const { bookingId, targetId, spaceId, rating, comment, type } = body
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('User:', user?.id, 'AuthError:', authError)
  
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .single()

  console.log('Booking:', booking, 'BookingError:', bookingError)

  if (booking?.status !== 'ended') {
    return NextResponse.json({ error: 'Location non terminée' }, { status: 400 })
  }

  const { error } = await supabase.from('reviews').insert({
    booking_id: bookingId,
    author_id: user.id,
    target_id: targetId,
    space_id: spaceId,
    rating,
    comment,
    type
  })

  console.log('Insert error:', error)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('target_id', targetId)

  if (reviews && reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    await supabase
      .from('profiles')
      .update({ rating_avg: avg, rating_count: reviews.length })
      .eq('id', targetId)
  }

  return NextResponse.json({ success: true })
}