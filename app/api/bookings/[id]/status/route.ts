import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, spaces(title, owner_id)')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })

  const spaceData = booking.spaces as any

  if (spaceData.owner_id !== user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  await supabase.from('bookings').update({ status }).eq('id', id)

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: renterAuth } = await adminClient.auth.admin.getUserById(booking.renter_id)
  const renterEmail = renterAuth?.user?.email

  const statusLabels: Record<string, string> = {
    confirmed: '✅ Votre demande a été acceptée !',
    active: '🎉 Votre location est maintenant active !',
    ended: '👋 Votre location est terminée',
    cancelled: '❌ Votre demande a été refusée'
  }

  const statusMessages: Record<string, string> = {
    confirmed: 'Le propriétaire a accepté votre demande.',
    active: 'La location est officiellement démarrée. Bon stockage !',
    ended: 'La location est terminée. Laissez un avis !',
    cancelled: 'Le propriétaire n\'a pas pu donner suite à votre demande.'
  }

  if (renterEmail && statusLabels[status]) {
    await resend.emails.send({
      from: 'Nestock <onboarding@resend.dev>',
      to: renterEmail,
      subject: `${statusLabels[status]} — ${spaceData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🗄️ Nestock</h2>
          <h3>${statusLabels[status]}</h3>
          <p>${statusMessages[status]}</p>
          <p><strong>Espace :</strong> ${spaceData.title}</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/messages?booking_id=${booking.id}"
            style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            Voir la conversation
          </a>
        </div>
      `
    })
  }

  return NextResponse.json({ success: true })
}
