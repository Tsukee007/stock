import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ui/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-500 hover:text-blue-600">← Dashboard</a>
          <h1 className="text-xl font-bold">👤 Mon profil</h1>
        </div>

        {/* Infos compte */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-2">
          <h2 className="font-bold text-lg">Compte</h2>
          <p className="text-gray-600 text-sm">Email : <strong>{user.email}</strong></p>
          <p className="text-gray-600 text-sm">Membre depuis : <strong>{new Date(user.created_at).toLocaleDateString('fr-FR')}</strong></p>
        </div>

        {/* Formulaire infos perso */}
        <ProfileForm profile={profile} userId={user.id} />

        {/* Stripe Connect */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-lg">💳 Compte Stripe</h2>
          {profile?.stripe_onboarding_complete ? (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4 text-sm text-green-700">
                <p className="font-semibold">✅ Compte Stripe connecté</p>
                <p>Vous pouvez recevoir des paiements sur votre IBAN.</p>
              </div>
              <a href="https://dashboard.stripe.com" target="_blank"
                className="block text-center bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition text-sm font-semibold">
                Accéder au tableau de bord Stripe →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-yellow-50 rounded-lg p-4 text-sm text-yellow-700">
                <p className="font-semibold">⚠️ Compte Stripe non connecté</p>
                <p>Connectez votre compte pour recevoir des paiements.</p>
              </div>
              <a href="/stripe/connect"
                className="block text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                Connecter mon compte Stripe →
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
