import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Connexion Stripe : reservee aux utilisateurs connectes
export default async function StripeConnectLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return children
}
