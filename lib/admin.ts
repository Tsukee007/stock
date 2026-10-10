import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Administrateur = compte du site dont app_metadata.role vaut 'admin'.
// app_metadata ne peut etre modifie qu'avec la cle service_role (jamais depuis le navigateur).
export function isAdmin(user: Pick<User, 'app_metadata'> | null) {
  return user?.app_metadata?.role === 'admin'
}

// A appeler en tete de chaque page d'administration
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')
  if (!isAdmin(user)) redirect('/')
  return user
}

// Variante pour les routes API : renvoie null au lieu de rediriger (la route repond 401)
export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return isAdmin(user) ? user : null
}

// Lecture de toutes les donnees (contourne les regles RLS) : uniquement apres requireAdmin()
export function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export function frDate(d: string | null | undefined, withTime = false) {
  if (!d) return ''
  return new Date(d).toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    day: '2-digit', month: '2-digit', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export const euros = (n: number | string | null | undefined) =>
  n == null ? '' : `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
