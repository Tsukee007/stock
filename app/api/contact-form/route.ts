import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json()

  await resend.emails.send({
    from: 'Nestock Contact <onboarding@resend.dev>',
    to: 'tsukee@tsukee.fr',
    subject: `[Nestock] Contact - ${subject}`,
    html: `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <p><strong>Message :</strong></p>
      <p>${message}</p>
    `
  })

  return NextResponse.json({ success: true })
}