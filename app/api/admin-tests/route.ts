import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('test_tracking')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Admin tests error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
