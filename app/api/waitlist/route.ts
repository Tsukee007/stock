import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { prenom, email, consent_email, consent_rgpd } = await req.json()

    if (!prenom || !email || !consent_rgpd) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('waitlist')
      .insert({ prenom, email, consent_email, consent_rgpd })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Cet email est deja inscrit.' },
          { status: 409 }
        )
      }
      throw error
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
