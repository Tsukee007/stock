import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Déposer une annonce : réservé aux utilisateurs connectés (vérifié avant d'afficher le formulaire)
export default async function NewSpaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return children
}
