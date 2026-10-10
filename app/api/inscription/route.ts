import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Appele par la page d'inscription juste apres le signUp :
// 1. enregistre le profil (nom, telephone, adresse) — le navigateur ne peut pas le faire
//    tant que l'adresse e-mail n'est pas confirmee (pas encore de session) ;
// 2. previent l'administrateur par e-mail.
// Garde-fous : compte cree il y a moins de 15 minutes, traite une seule fois.
const DELAI_MAX_MS = 15 * 60 * 1000

const escape = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function POST(req: Request) {
  try {
    const { user_id, full_name, phone, address, postal_code, city } = await req.json()
    if (typeof user_id !== 'string') {
      return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.admin.getUserById(user_id)
    if (error || !data.user) {
      return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 })
    }
    const user = data.user
    if (user.app_metadata?.admin_notified) {
      return NextResponse.json({ success: true })
    }
    if (Date.now() - new Date(user.created_at).getTime() > DELAI_MAX_MS) {
      return NextResponse.json({ error: 'Inscription trop ancienne' }, { status: 400 })
    }

    // Marque le compte d'abord : un second appel ne renverra ni profil ni e-mail
    await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, admin_notified: true },
    })

    const profile = { full_name, phone, address, postal_code, city }
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      ...Object.fromEntries(Object.entries(profile).filter(([, v]) => typeof v === 'string' && v.trim())),
    })
    if (profileError) console.error('Profil non enregistre:', profileError)

    const date = new Date(user.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
    await sendEmail({
      to: process.env.SMTP_USER!,
      subject: `[Nestock] Nouvelle inscription - ${full_name || user.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🗄️ Nestock - Nouvelle inscription</h2>
          <p><strong>Nom :</strong> ${escape(full_name)}</p>
          <p><strong>Email :</strong> ${escape(user.email)}</p>
          <p><strong>Telephone :</strong> ${escape(phone)}</p>
          <p><strong>Ville :</strong> ${escape([postal_code, city].filter(Boolean).join(' '))}</p>
          <p><strong>Date :</strong> ${escape(date)}</p>
          <p style="color: #6b7280;">La personne doit encore confirmer son adresse e-mail.</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin-inscrits" style="color: #2563eb;">Voir la liste des inscrits</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Inscription error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
