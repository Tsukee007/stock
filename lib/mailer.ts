import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  })
}
export async function sendWaitlistConfirmationEmail(to: string, prenom: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #2563eb;">Bonjour ${prenom},</h2>
      <p>Merci de ton inscription à la liste d'attente Nestock !</p>
      <p>Tu fais partie des premiers à rejoindre l'aventure. Voici où on en est :</p>

      <div style="margin: 24px 0;">
        <p><strong>📋 Étape 1 — Liste d'attente</strong><br/>
        On construit la communauté avant le lancement. <em>(en cours)</em></p>

        <p><strong>🔧 Étape 2 — Version bêta</strong><br/>
        Un accès anticipé sera ouvert à une partie de la liste d'attente pour tester la plateforme avant tout le monde.</p>

        <p><strong>🚀 Étape 3 — Lancement officiel</strong><br/>
        Ouverture complète de la marketplace : dépôt d'annonces, réservations, paiements sécurisés via Stripe.</p>
      </div>

      <p>Tu seras informé(e) par email à chaque étape.</p>

      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0;"><strong>👥 Fais connaître Nestock</strong></p>
        <p style="margin: 0 0 8px 0;">Tu connais quelqu'un qui a un espace inutilisé, ou qui cherche un espace de stockage pas cher ?</p>
        <p style="margin: 0;">
          <a href="https://nestock.pro/waitlist?utm_source=referral&utm_medium=email" style="color: #2563eb;">
            https://nestock.pro/waitlist?utm_source=referral&utm_medium=email
          </a>
        </p>
      </div>

      <p>À très vite,<br/>L'équipe Nestock</p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>
      <p style="font-size: 12px; color: #9ca3af;">
        Tu reçois cet email car tu t'es inscrit(e) à la liste d'attente Nestock.<br/>
        <a href="https://nestock.pro/unsubscribe?email=${encodeURIComponent(to)}" style="color: #9ca3af;">Se désinscrire</a>
      </p>
    </div>
  `

  try {
    await sendEmail({
      to,
      subject: "Bienvenue sur la liste d'attente Nestock 🎉",
      html,
    })
  } catch (error) {
    console.error("Erreur envoi email confirmation waitlist:", error)
  }
}