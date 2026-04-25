import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json()

  await sendEmail({
    to: process.env.SMTP_USER!,
    subject: `[Nestock] Contact - ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🗄️ Nestock - Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <p><strong>Message :</strong></p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px;">
          <p style="margin: 0;">${message}</p>
        </div>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}