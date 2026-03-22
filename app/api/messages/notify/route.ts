import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  console.log('📧 Notify route appelée')
  
  const { bookingId, content, senderId } = await req.json()
  console.log('📧 bookingId:', bookingId)

  const supabase = await createClient()

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`id, renter_id, spaces(title, owner_id)`)
    .eq('id', bookingId)
    .single()

  console.log('📧 booking:', booking, 'error:', bookingError)

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const spaceData = booking.spaces as any
  const recipientId = senderId === booking.renter_id
    ? spaceData.owner_id
    : booking.renter_id

  console.log('📧 recipientId:', recipientId)

  // Utiliser le client admin pour récupérer l'email
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(recipientId)
  const recipientEmail = authUser?.user?.email

  console.log('📧 recipientEmail:', recipientEmail, 'authError:', authError)

  if (!recipientEmail) return NextResponse.json({ error: 'No email found' }, { status: 400 })

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: 'Nestock <onboarding@resend.dev>',
    to: recipientEmail,
    subject: `💬 Nouveau message - ${spaceData.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🗄️ Nestock</h2>
        <p>Vous avez reçu un nouveau message concernant <strong>${spaceData.title}</strong> :</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0;">${content}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/messages?booking_id=${bookingId}"
          style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Répondre
        </a>
      </div>
    `
  })

  console.log('📧 emailData:', emailData, 'emailError:', emailError)

  return NextResponse.json({ success: true })
}
