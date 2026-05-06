import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, spaces(title, owner_id)')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Reservation introuvable' }, { status: 404 })

  const spaceData = booking.spaces as any
  const isOwner = user.id === spaceData.owner_id
  const isRenter = user.id === booking.renter_id

  if (!isOwner && !isRenter) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (status === 'ending') {
    const endingDate = new Date()
    endingDate.setDate(endingDate.getDate() + 15)

    await supabase.from('bookings').update({
      status: 'ending',
      ending_date: endingDate.toISOString()
    }).eq('id', id)

    const otherUserId = isOwner ? booking.renter_id : spaceData.owner_id
    const otherRole = isOwner ? 'Le propriétaire' : 'Le locataire'

    await supabase.from('notifications').insert({
      user_id: otherUserId,
      type: 'booking',
      title: 'Préavis de résiliation',
      message: otherRole + ' a initié la résiliation de la location pour ' + spaceData.title + '. Fin le ' + endingDate.toLocaleDateString('fr-FR'),
      link: '/dashboard/bookings/' + id
    })

    await supabase.from('messages').insert({
      booking_id: id,
      sender_id: user.id,
      content: 'Un préavis de 15 jours a été initié. La location prendra fin le ' + endingDate.toLocaleDateString('fr-FR') + '.'
    })

    const { data: otherUser } = await adminClient.auth.admin.getUserById(otherUserId)
    if (otherUser?.user?.email) {
      await sendEmail({
        to: otherUser.user.email,
        subject: 'Préavis de résiliation - ' + spaceData.title,
        html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>' + otherRole + ' a initié la résiliation de la location pour <strong>' + spaceData.title + '</strong>.</p><p>La location prendra fin le <strong>' + endingDate.toLocaleDateString('fr-FR') + '</strong>.</p><a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/dashboard/bookings/' + id + '" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Voir les détails</a></div>'
      })
    }

    return NextResponse.json({ success: true })
  }

  if (status === 'ended') {
    await supabase.from('bookings').update({ status: 'ended' }).eq('id', id)

    await supabase.from('messages').insert({
      booking_id: id,
      sender_id: user.id,
      content: 'La location est officiellement terminée. Merci et à bientôt !'
    })

    const otherUserId = isOwner ? booking.renter_id : spaceData.owner_id

    await supabase.from('notifications').insert({
      user_id: otherUserId,
      type: 'booking',
      title: 'Location terminée',
      message: 'La location pour ' + spaceData.title + ' est maintenant terminée.',
      link: '/dashboard'
    })

    return NextResponse.json({ success: true })
  }

  await supabase.from('bookings').update({ status }).eq('id', id)

  const autoMessages: Record<string, string> = {
    confirmed: 'Votre demande a ete acceptee !',
    cancelled: 'Votre demande a ete refusee.',
    active: 'La location est maintenant active. Bon stockage !',
  }

  if (autoMessages[status]) {
    await supabase.from('messages').insert({
      booking_id: id,
      sender_id: user.id,
      content: autoMessages[status]
    })
  }

  const { data: renterAuth } = await adminClient.auth.admin.getUserById(booking.renter_id)
  const renterEmail = renterAuth?.user?.email

  const statusLabels: Record<string, string> = {
    confirmed: 'Votre demande a ete acceptee !',
    active: 'Votre location est maintenant active !',
    cancelled: 'Votre demande a ete refusee'
  }

  if (renterEmail && statusLabels[status]) {
    await sendEmail({
      to: renterEmail,
      subject: statusLabels[status] + ' - ' + spaceData.title,
      html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><h3>' + statusLabels[status] + '</h3><p>Espace : ' + spaceData.title + '</p><a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/messages?booking_id=' + booking.id + '" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Voir la conversation</a></div>'
    })
  }

  return NextResponse.json({ success: true })
}
