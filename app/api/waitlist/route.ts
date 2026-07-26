import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(req: Request) {
  try {
    const { prenom, email, interet, source, consent_email, consent_rgpd } = await req.json()

    if (!prenom || !email || !interet || !consent_rgpd) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('waitlist')
      .insert({ prenom, email, interet, source: source || 'direct', consent_email, consent_rgpd })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Cet email est deja inscrit.' },
          { status: 409 }
        )
      }
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    const interetLabel = interet === 'louer' ? 'Louer un espace'
      : interet === 'proposer' ? 'Proposer un espace'
      : 'Les deux'

    try {
      console.log('SMTP_USER:', process.env.SMTP_USER)
      console.log('SMTP_PASS defini:', !!process.env.SMTP_PASS)
      await transporter.sendMail({
        from: '"Nestock" <contact@nestock.pro>',
        to: email,
        subject: 'Tu es sur la liste d attente Nestock !',
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <span style="font-size: 24px; font-weight: bold; color: #2563eb;">Nestock</span>
            </div>
            <h1 style="font-size: 22px; color: #111827; margin-bottom: 12px;">Bonjour ${prenom} !</h1>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 16px;">
              Tu es bien inscrit sur la liste d attente de Nestock. Merci pour ton interet !
            </p>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 24px;">
              Tu seras parmi les premiers notifies au lancement et tu beneficieras des offres reservees aux premiers inscrits.
            </p>
            <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Ton profil :</strong></p>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Interet : ${interetLabel}</p>
            </div>

            <div style="margin-bottom: 24px;">
              <p style="color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Les prochaines etapes :</p>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
                <strong>Etape 1 — Liste d attente</strong> (en cours)<br/>
                On construit la communaute avant le lancement.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
                <strong>Etape 2 — Version beta</strong><br/>
                Un acces anticipe sera ouvert a une partie de la liste d attente pour tester la plateforme avant tout le monde.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                <strong>Etape 3 — Lancement officiel</strong><br/>
                Ouverture complete de la marketplace : depot d annonces, reservations, paiements securises.
              </p>
            </div>

            <div style="background: #eff6ff; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: 600;">Fais connaitre Nestock</p>
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Tu connais quelqu un qui a un espace inutilise, ou qui cherche un espace de stockage pas cher ?
              </p>
              <p style="margin: 0;">
                <a href="https://nestock.pro/waitlist?utm_source=referral&utm_medium=email" style="color: #2563eb; font-size: 14px;">
                  https://nestock.pro/waitlist?utm_source=referral&utm_medium=email
                </a>
              </p>
            </div>

            <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
              Conformement au RGPD, tu peux demander la suppression de tes donnees a tout moment en repondant a cet email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Nestock — contact@nestock.pro</p>
          </div>
        `
      })

      await transporter.sendMail({
        from: '"Nestock Waitlist" <contact@nestock.pro>',
        to: 'contact@nestock.pro',
        subject: 'Nouvel inscrit sur la waitlist : ' + prenom,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
            <h2 style="color: #111827;">Nouvel inscrit sur la waitlist</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr><td style="padding: 8px; color: #6b7280; font-size: 14px;">Prenom</td><td style="padding: 8px; font-weight: 500; color: #111827;">${prenom}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 8px; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 8px; font-weight: 500; color: #111827;">${email}</td></tr>
              <tr><td style="padding: 8px; color: #6b7280; font-size: 14px;">Interet</td><td style="padding: 8px; font-weight: 500; color: #111827;">${interetLabel}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 8px; color: #6b7280; font-size: 14px;">Source</td><td style="padding: 8px; font-weight: 500; color: #111827;">${source || 'direct'}</td></tr>
              <tr><td style="padding: 8px; color: #6b7280; font-size: 14px;">Consent email</td><td style="padding: 8px; font-weight: 500; color: #111827;">${consent_email ? 'Oui' : 'Non'}</td></tr>
            </table>
          </div>
        `
      })
    } catch (mailErr) {
      console.error('Mail error (non bloquant):', mailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}