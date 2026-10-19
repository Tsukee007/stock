import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { isOwnerStripeReady } from '@/lib/ownerStripe'
import { noticeEnd } from '@/lib/billing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

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

  // Écritures sur bookings avec la clé serveur : la règle d'accès ne laisse modifier que le propriétaire,
  // ce qui faisait échouer en silence la résiliation demandée par le locataire. Les droits sont vérifiés ci-dessus.
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Chaque action n'est possible qu'à la bonne étape de la location
  const allowedFrom: Record<string, string[]> = {
    ending: ['active'],
    acknowledge_notice: ['ending'],
    confirmed: ['pending'],
    cancelled: ['pending', 'awaiting_signature'],
  }
  if (!allowedFrom[status]) {
    // « ended » est posé par le cron de fin de location, pas par les utilisateurs
    return NextResponse.json({ error: 'Statut non autorise' }, { status: 400 })
  }
  if (!allowedFrom[status].includes(booking.status)) {
    return NextResponse.json({ error: 'Action impossible à cette étape de la location' }, { status: 409 })
  }
  if (status === 'acknowledge_notice' && booking.notice_initiated_by === (isOwner ? 'owner' : 'renter')) {
    return NextResponse.json({ error: 'Le préavis doit être confirmé par l\'autre partie' }, { status: 403 })
  }

  if (status === 'ending') {
    // Fin toujours en fin de mois : préavis jusqu'au 15 inclus → fin du mois en cours, sinon fin du mois suivant
    const { endingDate, cancelAt } = noticeEnd()

    await adminClient.from('bookings').update({
      status: 'ending',
      ending_date: endingDate.toISOString(),
      notice_initiated_by: isRenter ? 'renter' : 'owner',
      notice_initiated_at: new Date().toISOString()
    }).eq('id', id)

    // L'abonnement (prélevé le 1er) s'arrête le 1er du mois qui suit la fin, à minuit :
    // pile à la fin d'une période payée, donc ni prélèvement en trop ni remboursement.
    if (booking.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(booking.stripe_subscription_id, {
          cancel_at: Math.floor(cancelAt.getTime() / 1000),
          proration_behavior: 'none',
        })
      } catch (stripeErr) {
        console.error('Erreur programmation annulation Stripe pour booking ' + id + ':', stripeErr)
      }
    }

    const otherUserId = isOwner ? booking.renter_id : spaceData.owner_id
    const otherRole = isOwner ? 'Le propriétaire' : 'Le locataire'

    await supabase.from('notifications').insert({
      user_id: otherUserId,
      type: 'booking',
      title: 'Préavis de résiliation',
      message: otherRole + ' a initié la résiliation de la location pour ' + spaceData.title + '. Fin le ' + endingDate.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }),
      link: '/dashboard/bookings/' + id
    })

    await supabase.from('messages').insert({
      booking_id: id,
      sender_id: user.id,
      content: 'Un préavis a été donné. La location prendra fin le ' + endingDate.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }) + ' au soir ; le dernier mois prélevé est dû en entier.'
    })

    const { data: otherUser } = await adminClient.auth.admin.getUserById(otherUserId)
    if (otherUser?.user?.email) {
      await sendEmail({
        to: otherUser.user.email,
        subject: 'Préavis de résiliation - ' + spaceData.title,
        html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>' + otherRole + ' a initié la résiliation de la location pour <strong>' + spaceData.title + '</strong>.</p><p>La location prendra fin le <strong>' + endingDate.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }) + '</strong>.</p><p>Veuillez accuser réception depuis votre dashboard.</p><a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Accuser réception</a></div>'
      })
    }

    return NextResponse.json({ success: true })
  }

  if (status === 'acknowledge_notice') {
    await adminClient.from('bookings').update({
      notice_acknowledged_at: new Date().toISOString()
    }).eq('id', id)

    const otherUserId = isOwner ? booking.renter_id : spaceData.owner_id

    await supabase.from('notifications').insert({
      user_id: otherUserId,
      type: 'booking',
      title: 'Préavis accusé de réception',
      message: 'Le propriétaire a accusé réception du préavis pour ' + spaceData.title + '. La location se terminera le ' + new Date(booking.ending_date).toLocaleDateString('fr-FR'),
      link: '/dashboard/bookings/' + id
    })

    await supabase.from('messages').insert({
      booking_id: id,
      sender_id: user.id,
      content: 'Le propriétaire a bien accusé réception du préavis de résiliation.'
    })

    const { data: otherUser } = await adminClient.auth.admin.getUserById(otherUserId)
    if (otherUser?.user?.email) {
      await sendEmail({
        to: otherUser.user.email,
        subject: 'Préavis accusé de réception - ' + spaceData.title,
        html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>Le propriétaire a accusé réception de votre préavis pour <strong>' + spaceData.title + '</strong>.</p><p>La location se terminera le <strong>' + new Date(booking.ending_date).toLocaleDateString('fr-FR') + '</strong>.</p></div>'
      })
    }

    return NextResponse.json({ success: true })
  }

  if (status === 'ended') {
    await adminClient.from('bookings').update({ status: 'ended' }).eq('id', id)

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

  // Seuls le refus (les deux parties) et l'acceptation (propriétaire au compte Stripe actif) passent par ici :
  // la signature et le paiement font avancer les autres statuts
  if (status === 'confirmed') {
    if (!isOwner) return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
    if (!(await isOwnerStripeReady(spaceData.owner_id))) {
      return NextResponse.json({ error: 'Finalisez votre inscription Stripe avant d\'accepter une location.' }, { status: 409 })
    }
  } else if (status !== 'cancelled') {
    return NextResponse.json({ error: 'Statut non autorise' }, { status: 400 })
  }

  await adminClient.from('bookings').update({ status }).eq('id', id)

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
