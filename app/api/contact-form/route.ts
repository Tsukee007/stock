import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'

// Le texte saisi par le visiteur est inséré dans un e-mail HTML : on l'échappe
const escape = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json()

  const sent = await sendEmail({
    to: process.env.SMTP_USER!,
    subject: `[Nestock] Contact - ${String(subject ?? "").replace(/[\r\n]+/g, " ").slice(0, 150)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🗄️ Nestock - Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${escape(name)}</p>
        <p><strong>Email :</strong> ${escape(email)}</p>
        <p><strong>Sujet :</strong> ${escape(subject)}</p>
        <p><strong>Message :</strong></p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; white-space: pre-wrap;">${escape(message)}</p>
        </div>
      </div>
    `
  })

  if (!sent) {
    return NextResponse.json({ error: 'Votre message n\'a pas pu être envoyé. Réessayez dans quelques minutes ou écrivez à contact@nestock.pro.' }, { status: 502 })
  }
  return NextResponse.json({ success: true })
}