import { createClient } from '@supabase/supabase-js'

// Disponibilité des espaces pour les visiteurs (carte, page d'annonce).
// Lue côté serveur avec la clé serveur : la table bookings n'est plus lisible publiquement,
// et seuls le statut et la date de fin sortent d'ici (ni locataire, ni prix, ni identifiants Stripe).

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const OCCUPYING = ['pending', 'awaiting_signature', 'confirmed', 'active', 'ending']

export type SpaceOccupancy = { status: string; ending_date: string | null }

export async function occupancyBySpace(spaceIds: string[]) {
  const bySpace = new Map<string, SpaceOccupancy[]>()
  if (spaceIds.length === 0) return bySpace
  const { data, error } = await supabase
    .from('bookings')
    .select('space_id, status, ending_date')
    .in('space_id', spaceIds)
    .in('status', OCCUPYING)
  if (error) console.error('Disponibilités illisibles', error)
  for (const b of data ?? []) {
    const list = bySpace.get(b.space_id) ?? []
    list.push({ status: b.status, ending_date: b.ending_date })
    bySpace.set(b.space_id, list)
  }
  return bySpace
}
