import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Reçoit l'état complet du suivi des tests envoyé par AI Framework (agent Testeur)
// et remplace le contenu de la table test_tracking. Protégé par TESTS_SYNC_SECRET.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SyncedTest {
  id: string
  title: string
  category?: string | null
  description?: string | null
  status: string
  summary?: string | null
  details?: string | null
  source?: string | null
  mission_id?: number | null
  date?: string | null
}

function sameSecret(received: string, expected: string): boolean {
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const secret = process.env.TESTS_SYNC_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Variable TESTS_SYNC_SECRET non configuree sur Vercel' }, { status: 500 })
  }
  const auth = req.headers.get('authorization') ?? ''
  if (!sameSecret(auth.replace(/^Bearer\s+/i, ''), secret)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  let tests: SyncedTest[]
  try {
    const body = await req.json()
    tests = body.tests
    if (!Array.isArray(tests) || tests.some(t => typeof t?.id !== 'string' || typeof t?.title !== 'string' || typeof t?.status !== 'string')) {
      return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
  }

  const syncedAt = new Date().toISOString()
  const rows = tests.map((t, i) => ({
    test_id: t.id,
    position: i,
    title: t.title,
    category: t.category ?? null,
    description: t.description ?? null,
    status: t.status,
    summary: t.summary ?? null,
    details: t.details ?? null,
    source: t.source ?? null,
    mission_id: t.mission_id ?? null,
    result_date: t.date ?? null,
    synced_at: syncedAt,
  }))

  const { error } = await supabase.from('test_tracking').upsert(rows, { onConflict: 'test_id' })
  if (error) {
    console.error('Sync tests:', error)
    return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
  }
  // Tests retirés du cahier : supprimés du suivi.
  const ids = rows.map(r => r.test_id)
  const { error: cleanupError } = ids.length
    ? await supabase.from('test_tracking').delete().not('test_id', 'in', `(${ids.map(id => `"${id}"`).join(',')})`)
    : await supabase.from('test_tracking').delete().neq('test_id', '')
  if (cleanupError) {
    console.error('Sync tests (nettoyage):', cleanupError)
  }

  return NextResponse.json({ received: rows.length })
}
