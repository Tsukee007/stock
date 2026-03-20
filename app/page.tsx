import SpacesMap from '@/components/map/SpacesMap'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, title, city, lat, lng, price_month, type')
    .eq('is_active', true)

  return (
    <main className="flex flex-col h-screen">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">🗄️ Nestock</h1>
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-600">👤 {user.email}</span>
              <a href="/spaces/new" className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                + Déposer une annonce
              </a>
              <a href="/api/logout" className="text-sm text-gray-400 hover:text-red-500">
                Déconnexion
              </a>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm text-gray-600 hover:text-blue-600">Connexion</a>
              <a href="/register" className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                S'inscrire
              </a>
            </>
          )}
        </div>
      </header>
      <div className="flex-1">
        <SpacesMap spaces={spaces ?? []} />
      </div>
    </main>
  )
}

