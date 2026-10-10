import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Liste des comptes inscrits (remplace l'ancienne liste d'attente)
export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: 'Variable ADMIN_PASSWORD non configuree' }, { status: 500 })
    }
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (usersError) {
      return NextResponse.json({ error: 'Erreur lecture des comptes' }, { status: 500 })
    }

    const [profiles, spaces, bookings] = await Promise.all([
      supabase.from('profiles').select('id, full_name, phone, city'),
      supabase.from('spaces').select('owner_id'),
      supabase.from('bookings').select('renter_id'),
    ])
    if (profiles.error || spaces.error || bookings.error) {
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    const profileById = new Map(profiles.data.map(p => [p.id, p]))
    const count = (ids: (string | null)[], id: string) => ids.filter(x => x === id).length

    const data = usersData.users
      .map(u => {
        const p = profileById.get(u.id)
        return {
          id: u.id,
          email: u.email ?? '',
          full_name: p?.full_name || '',
          phone: p?.phone || '',
          city: p?.city || '',
          created_at: u.created_at,
          email_confirmed_at: u.email_confirmed_at ?? null,
          last_sign_in_at: u.last_sign_in_at ?? null,
          spaces: count(spaces.data.map(s => s.owner_id), u.id),
          bookings: count(bookings.data.map(b => b.renter_id), u.id),
        }
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at))

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Admin inscrits error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
