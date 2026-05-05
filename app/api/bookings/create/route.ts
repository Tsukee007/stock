import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { space_id, start_date, message } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { data: space } = await supabase
    .from('spaces')
    .select('id, title, owner_id, price_month, city')
    .eq('id', space_id)
    .single()

  if (!space) return NextResponse.json({ error: 'Espace introuvable' }, { status: 404 })

  if (space.owner_id === user.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas reserver votre propre espace' }, { status: 400 })
  }

  // Vérifier si une réservation active existe déjà
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('space_id', space.id)
    .eq('renter_id', user.id)
    .in('status', ['pending', 'awaiting_signature', 'confirmed', 'active'])
    .single()

  if (existingBooking) {
    return NextResponse.json({ 
      error: 'Vous avez deja une reservation en cours pour cet espace',
      bookingId: existingBooking.id
    }, { status: 400 })
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      space_id: space.id,
      renter_id: user.id,
      status: 'pending',
      start_date,
      price_month: space.price_month
    })
    .select()
    .single()

  if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 500 })

  if (message) {
    await supabase.from('messages').insert({
      booking_id: booking.id,
      sender_id: user.id,
      content: message
    })
  }

  await supabase.from('messages').insert({
    booking_id: booking.id,
    sender_id: user.id,
    content: 'Bonjour, je souhaite louer votre espace de stockage a partir du ' + new Date(start_date).toLocaleDateString('fr-FR') + '. Merci de confirmer votre disponibilite.'
  })

  await supabase.from('notifications').insert({
    user_id: space.owner_id,
    type: 'booking',
    title: 'Nouvelle demande de reservation !',
    message: 'Quelqu un souhaite louer ' + space.title + ' a partir du ' + new Date(start_date).toLocaleDateString('fr-FR'),
    link: '/dashboard'
  })

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: ownerAuth } = await adminClient.auth.admin.getUserById(space.owner_id)
  const ownerEmail = ownerAuth?.user?.email

  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: 'Nouvelle demande de reservation - ' + space.title,
      html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>Vous avez recu une nouvelle demande de reservation pour <strong>' + space.title + '</strong>.</p><p><strong>Date de debut souhaitee :</strong> ' + new Date(start_date).toLocaleDateString('fr-FR') + '</p><a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Voir la demande</a></div>'
    })
  }

  return NextResponse.json({ success: true, bookingId: booking.id })
}
