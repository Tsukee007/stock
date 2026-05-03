import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { bookingId, content, senderId } = await req.json()
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, spaces(title, owner_id)')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const spaceData = booking.spaces as any
  const recipientId = senderId === booking.renter_id ? spaceData.owner_id : booking.renter_id

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authUser } = await adminClient.auth.admin.getUserById(recipientId)
  const recipientEmail = authUser?.user?.email

  // Créer une notification en temps réel
  await supabase.from('notifications').insert({
    user_id: recipientId,
    type: 'message',
    title: 'Nouveau message',
    message: content.substring(0, 80) + (content.length > 80 ? '...' : ''),
    link: '/messages?booking_id=' + bookingId
  })

  if (!recipientEmail) return NextResponse.json({ error: 'No email' }, { status: 400 })

  await sendEmail({
    to: recipientEmail,
    subject: 'Nouveau message - ' + spaceData.title,
    html: '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #2563eb;">Nestock</h2><p>Vous avez recu un nouveau message concernant <strong>' + spaceData.title + '</strong> :</p><div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;"><p style="margin: 0;">' + content + '</p></div><a href="' + process.env.NEXT_PUBLIC_SITE_URL + '/messages?booking_id=' + bookingId + '" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Repondre</a></div>'
  })

  return NextResponse.json({ success: true })
}
