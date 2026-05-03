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

  if (spaceData.owner_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  await supabase.from('bookings').update({ status }).eq('id', id)

  const autoMessages: Record<string, string> = {
    confirmed: 'Votre demande a ete acceptee ! Vous pouvez maintenant convenir des modalites.',
    cancelled: 'Votre demande a ete refusee.',
    active: 'La location est maintenant active. Bon stockage !',
    ended: 'La location est terminee. Merci et a bientot !'
  }

  if (autoMessages[status]) {
    await supabase.from('messages').insert({
      booking_id: id,
      sender_id: user.id,
      content: autoMessages[status]
    })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: renterAuth } = await adminClient.auth.admin.getUserById(booking.renter_id)
  const renterEmail = renterAuth?.user?.email

  const notifTitles: Record<string, string> = {
    confirmed: 'Demande acceptee !',
    active: 'Location active !',
    ended: 'Location terminee',
    cancelled: 'Demande refusee',
    awaiting_signature: 'Contrat a signer'
  }

  const notifMessages: Record<string, string> = {
    confirmed: 'Le proprietaire a accepte votre demande pour ' + spaceData.title,
    active: 'Votre location est officielle. Bon stockage !',
    ended: 'La location est terminee. Laissez un avis !',
    cancelled: 'Le proprietaire ne peut pas donner suite.',
    awaiting_signature: 'Le contrat pour ' + spaceData.title + ' est pret a signer.'
  }

  const notifLinks: Record<string, string> = {
    confirmed: '/messages?booking_id=' + id,
    active: '/dashboard',
    ended: '/dashboard',
    cancelled: '/',
    awaiting_signature: '/contracts/' + id
  }

  if (notifTitles[status]) {
    await supabase.from('notifications').insert({
      user_id: booking.renter_id,
      type: 'booking',
      title: notifTitles[status],
      message: notifMessages[status],
      link: notifLinks[status]
    })
  }

  const statusLabels: Record<string, string> = {
    confirmed: 'Votre demande a ete acceptee !',
    active: 'Votre location est maintenant active !',
    ended: 'Votre location est terminee',
    cancelled: 'Votre demande a ete refusee'
  }

  const statusMessages: Record<string, string> = {
    confirmed: 'Le proprietaire a accepte votre demande.',
    active: 'La location est officiellement demarree. Bon stockage !',
    ended: 'La location est terminee. Laissez un avis !',
    cancelled: "Le proprietaire n'a pas pu donner suite."
  }

  if (renterEmail && statusLabels[status]) {
    await sendEmail({
      to: renterEmail,
      subject: statusLabels[status] + ' - ' + spaceData.title,
      html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><h3>' + statusLabels[status] + '</h3><p>' + statusMessages[status] + '</p><p><strong>Espace :</strong> ' + spaceData.title + '</p><a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/messages?booking_id=' + booking.id + '" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Voir la conversation</a></div>'
    })
  }

  return NextResponse.json({ success: true })
}
