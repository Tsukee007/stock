import { createClient } from '@/lib/supabase/server'
import SearchFilters from '@/components/map/SearchFilters'
import MapWithList from '@/components/map/MapWithList'

type SearchParams = {
  city?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  minSurface?: string
  radius?: string
  lat?: string
  lng?: string
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('spaces')
    .select('id, title, city, lat, lng, price_month, type, surface_m2, address')
    .eq('is_active', true)

  if (filters.city && !filters.lat) query = query.ilike('city', `%${filters.city}%`)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.minPrice) query = query.gte('price_month', parseFloat(filters.minPrice))
  if (filters.maxPrice) query = query.lte('price_month', parseFloat(filters.maxPrice))
  if (filters.minSurface) query = query.gte('surface_m2', parseFloat(filters.minSurface))

  let { data: spaces } = await query

  if (spaces && filters.lat && filters.lng && filters.radius) {
    const lat = parseFloat(filters.lat)
    const lng = parseFloat(filters.lng)
    const radius = parseFloat(filters.radius)
    spaces = spaces.filter(s =>
      s.lat && s.lng && getDistanceKm(lat, lng, s.lat, s.lng) <= radius
    )
  }

  if (user) {
    return (
      <main className="relative flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        <SearchFilters initialFilters={filters} />
        <div className="flex-1 pt-16 md:pt-16">
          <MapWithList spaces={spaces ?? []} />
        </div>
      </main>
    )
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Louez un espace de stockage<br />
            <span className="text-blue-200">près de chez vous</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Nestock met en relation particuliers et professionnels pour louer des caves, garages, entrepôts
            et boxes de stockage. Simple, sécurisé, local.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a href="/register"
              className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition text-lg">
              Trouver un espace
            </a>
            <a href="/register"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition text-lg">
              Louer mon espace
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold text-blue-600">{spaces?.length ?? 0}+</p>
            <p className="text-gray-500 text-sm mt-1">Espaces disponibles</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-blue-600">100%</p>
            <p className="text-gray-500 text-sm mt-1">Contrats sécurisés</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-blue-600">0€</p>
            <p className="text-gray-500 text-sm mt-1">Sans frais d'inscription</p>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-bold text-gray-800">1. Recherchez</h3>
              <p className="text-gray-500 text-sm">
                Parcourez les annonces près de chez vous sur la carte. Filtrez par type, surface et prix.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
              <div className="text-4xl">✍️</div>
              <h3 className="font-bold text-gray-800">2. Signez en ligne</h3>
              <p className="text-gray-500 text-sm">
                Un contrat numérique est généré automatiquement. Propriétaire et locataire signent en ligne.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
              <div className="text-4xl">🔑</div>
              <h3 className="font-bold text-gray-800">3. Stockez</h3>
              <p className="text-gray-500 text-sm">
                Le paiement mensuel est automatique via Stripe. Accédez à votre espace en toute sérénité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Pourquoi Nestock ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '🛡️', title: 'Contrats légaux', desc: 'Contrats de location conformes au droit français, signés électroniquement (article 1366 du Code civil).' },
              { icon: '💳', title: 'Paiements sécurisés', desc: 'Paiements automatiques via Stripe. Votre argent est protégé à chaque transaction.' },
              { icon: '📍', title: 'Local et transparent', desc: 'Visualisez les espaces sur une carte interactive. Adresse et photos vérifiées par nos équipes.' },
              { icon: '📱', title: 'Tout depuis votre téléphone', desc: 'Signez, payez, contactez le propriétaire et gérez vos locations depuis votre mobile.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aperçu carte */}
      <section className="py-6 px-4 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto mb-4">
          <h2 className="text-xl font-bold text-gray-800">Espaces disponibles</h2>
          <p className="text-gray-500 text-sm">
            Inscrivez-vous gratuitement pour contacter les propriétaires et réserver.
          </p>
        </div>
        <div className="relative" style={{ height: '500px' }}>
          <SearchFilters initialFilters={filters} />
          <div className="h-full pt-14">
            <MapWithList spaces={spaces ?? []} />
          </div>
          {/* Overlay incitant à s'inscrire */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <a href="/register"
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition whitespace-nowrap">
              S'inscrire gratuitement pour réserver
            </a>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-blue-600 text-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-3xl font-extrabold">Prêt à commencer ?</h2>
          <p className="text-blue-100">
            Rejoignez Nestock et trouvez votre espace de stockage idéal, ou monétisez l'espace inutilisé chez vous.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/register"
              className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition">
              Créer un compte gratuit
            </a>
            <a href="/login"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition">
              Se connecter
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
