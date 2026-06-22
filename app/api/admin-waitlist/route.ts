import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    const adminPassword = process.env.ADMIN_PASSWORD
    console.log('ADMIN_PASSWORD defini:', !!adminPassword)
    console.log('Password recu:', !!password)

    if (!adminPassword) {
      return NextResponse.json({ error: 'Variable ADMIN_PASSWORD non configuree sur Vercel' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Admin error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
