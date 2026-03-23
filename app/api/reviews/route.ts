import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { bookingId, targetId, spaceId, rating, comment, type } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Vérifier que la réservation est bien terminée
  const { data: booking } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .single()

  if (booking?.status !== 'ended') {
    return NextResponse.json({ error: 'Location non terminée' }, { status: 400 })
  }

  // Créer l'avis
  const { error } = await supabase.from('reviews').insert({
    booking_id: bookingId,
    author_id: user.id,
    target_id: targetId,
    space_id: spaceId,
    rating,
    comment,
    type
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mettre à jour la note moyenne du profil cible
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
