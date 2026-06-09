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

  const { data: mySpaces } = await supabase
    .from('spaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)

  const isOwner = mySpaces && mySpaces.length > 0

  const { data: myBookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('renter_id', user.id)
    .in('status', ['active', 'confirmed', 'ending'])
    .limit(1)

  const isRenter = myBookings && myBookings.length > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-500 hover:text-blue-600">← Retour</a>
          <h1 className="text-xl font-bold">👤 Mon profil</h1>
        </div>

        <ProfileForm profile={profile} userId={user.id} userEmail={user.email ?? ""} />

        {isOwner && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-lg">💳 Compte Stripe — Propriétaire</h2>
            {profile?.stripe_onboarding_complete ? (
              <div className="space-y-3">
                <div className="bg-green-50 rounded-lg p-4 text-sm text-green-700">
                  <p className="font-semibold">✅ Compte Stripe connecté</p>
                  <p>Vos loyers sont virés automatiquement sur votre compte.</p>
                </div>
                <a href="https://dashboard.stripe.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition text-sm font-semibold">
                  Accéder à mon dashboard Stripe →
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
                  Connecter mon compte Stripe
                </a>
              </div>
            )}
          </div>
        )}

        {isRenter && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-lg">💳 Mes paiements — Locataire</h2>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-semibold">ℹ️ Gérer mes paiements</p>
              <p>Accédez au portail Stripe pour gérer votre abonnement, vos moyens de paiement et consulter vos factures.</p>
            </div>
            <a href="/api/stripe/portal"
              className="block text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
              Accéder à mon espace paiement →
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
