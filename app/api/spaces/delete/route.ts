import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request) {
  const { spaceId } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { data: space } = await supabase
    .from('spaces')
    .select('owner_id')
    .eq('id', spaceId)
    .single()

  if (!space || space.owner_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { data: activeBookings } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('space_id', spaceId)
    .in('status', ['pending', 'awaiting_signature', 'confirmed', 'active'])

  if (activeBookings && activeBookings.length > 0) {
    return NextResponse.json({ 
      error: 'Impossible de supprimer une annonce avec une réservation en cours'
    }, { status: 400 })
  }

  await supabase.from('space_photos').delete().eq('space_id', spaceId)
  await supabase.from('bookings').delete().eq('space_id', spaceId)
  await supabase.from('spaces').delete().eq('id', spaceId)

  return NextResponse.json({ success: true })
}
