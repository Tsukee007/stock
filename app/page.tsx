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
    <main className="bg-white">

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block bg-blue-600 text-blue-100 text-sm px-4 py-1.5 rounded-full font-medium">
            La marketplace française du stockage entre particuliers
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Trouvez ou louez un espace de stockage
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Caves, garages, boxes, greniers... Nestock connecte propriétaires et locataires
            pour des locations simples, sécurisées et avec contrat électronique.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a href="/register" className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition text-lg shadow-lg">
              Trouver un espace
            </a>
            <a href="/register" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition text-lg">
              Louer mon espace
            </a>
          </div>
          <p className="text-blue-200 text-sm">Inscription gratuite - Aucun frais cache - Contrat inclus</p>
        </div>
      </section>

      <section className="bg-white border-b py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold text-blue-600">{spaces?.length ?? 0}+</p>
            <p className="text-gray-500 text-sm mt-1">Espaces disponibles</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-blue-600">100%</p>
            <p className="text-gray-500 text-sm mt-1">Contrats securises</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-blue-600">0 euro</p>
            <p className="text-gray-500 text-sm mt-1">Inscription gratuite</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-blue-600">15j</p>
            <p className="text-gray-500 text-sm mt-1">Preavis de resiliation</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Comment louer un espace ?</h2>
            <p className="text-gray-500 mt-2">En quelques etapes simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">1</div>
              <div className="text-4xl">🔍</div>
              <h3 className="font-bold text-gray-800">Recherchez</h3>
              <p className="text-gray-500 text-sm">Parcourez les annonces sur la carte. Filtrez par ville, type et prix.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">2</div>
              <div className="text-4xl">📩</div>
              <h3 className="font-bold text-gray-800">Demandez</h3>
              <p className="text-gray-500 text-sm">Envoyez une demande de reservation avec votre date souhaitee.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">3</div>
              <div className="text-4xl">✍️</div>
              <h3 className="font-bold text-gray-800">Signez</h3>
              <p className="text-gray-500 text-sm">Signez le contrat electronique directement sur la plateforme.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">4</div>
              <div className="text-4xl">🔑</div>
              <h3 className="font-bold text-gray-800">Stockez</h3>
              <p className="text-gray-500 text-sm">Paiement automatique chaque mois. Resiliez avec 15j de preavis.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-green-100 text-green-700 text-sm px-4 py-1.5 rounded-full font-medium">
                Pour les proprietaires
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Votre espace inutilise peut vous rapporter</h2>
              <p className="text-gray-600">Garage vide, cave disponible ? Louez-le et generez des revenus passifs chaque mois.</p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Annonce gratuite et rapide a creer</p>
                <p>Contrat electronique automatique</p>
                <p>Paiement securise via Stripe Connect</p>
                <p>Virements directs sur votre IBAN</p>
                <p>Vous fixez votre prix, vous gardez tout</p>
              </div>
              <a href="/register" className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition">
                Deposer mon annonce gratuitement
              </a>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 space-y-4">
              <p className="font-bold text-gray-700 text-center mb-4">Simulateur de revenus</p>
              <div className="bg-white rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Votre prix</span>
                  <span className="font-bold">100 euros/mois</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Commission Nestock (10%)</span>
                  <span>+ 10 euros</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Frais Stripe</span>
                  <span>+ 1.75 euros</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-blue-700">
                  <span>Locataire paie</span>
                  <span>111.75 euros/mois</span>
                </div>
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Vous recevez</span>
                  <span>100 euros/mois</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Pourquoi choisir Nestock ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-white hover:border-blue-100 transition">
              <span className="text-3xl">🛡️</span>
              <div>
                <h3 className="font-bold text-gray-800">Contrats legaux</h3>
                <p className="text-gray-500 text-sm mt-1">Contrats conformes au droit francais, signes electroniquement (article 1366 du Code civil).</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-white hover:border-blue-100 transition">
              <span className="text-3xl">💳</span>
              <div>
                <h3 className="font-bold text-gray-800">Paiements securises</h3>
                <p className="text-gray-500 text-sm mt-1">Paiements automatiques via Stripe, certifie PCI-DSS. Proprietaire paye directement sur son IBAN.</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-white hover:border-blue-100 transition">
              <span className="text-3xl">📍</span>
              <div>
                <h3 className="font-bold text-gray-800">Carte interactive</h3>
                <p className="text-gray-500 text-sm mt-1">Visualisez tous les espaces disponibles sur une carte. Filtrez par distance, prix et surface.</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-white hover:border-blue-100 transition">
              <span className="text-3xl">📄</span>
              <div>
                <h3 className="font-bold text-gray-800">Quittances automatiques</h3>
                <p className="text-gray-500 text-sm mt-1">Une quittance de loyer est generee et envoyee par email apres chaque paiement mensuel.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white border-t">
        <div className="max-w-5xl mx-auto mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Espaces disponibles pres de chez vous</h2>
          <p className="text-gray-500 text-sm mt-1">Inscrivez-vous gratuitement pour contacter les proprietaires et reserver.</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden" style={{ height: '500px' }}>
          <SearchFilters initialFilters={filters} />
          <div className="h-full pt-14">
            <MapWithList spaces={spaces ?? []} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <a href="/register" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition whitespace-nowrap text-lg">
              S'inscrire gratuitement pour reserver
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Questions frequentes</h2>
          <div className="space-y-4">
            <details className="bg-white rounded-xl p-5 cursor-pointer border border-gray-100">
              <summary className="font-semibold text-gray-800 list-none flex justify-between items-center">
                Est-ce que Nestock est gratuit ?
                <span className="text-blue-600 text-xl">+</span>
              </summary>
              <p className="text-gray-600 text-sm mt-3">L'inscription est entierement gratuite. Nestock prend une commission de 10% uniquement sur les transactions realisees.</p>
            </details>
            <details className="bg-white rounded-xl p-5 cursor-pointer border border-gray-100">
              <summary className="font-semibold text-gray-800 list-none flex justify-between items-center">
                Le contrat est-il legalement valide ?
                <span className="text-blue-600 text-xl">+</span>
              </summary>
              <p className="text-gray-600 text-sm mt-3">Oui. Les contrats signes sur Nestock ont la meme valeur juridique qu'une signature manuscrite, conformement a l'article 1366 du Code civil francais.</p>
            </details>
            <details className="bg-white rounded-xl p-5 cursor-pointer border border-gray-100">
              <summary className="font-semibold text-gray-800 list-none flex justify-between items-center">
                Comment je recois mon argent en tant que proprietaire ?
                <span className="text-blue-600 text-xl">+</span>
              </summary>
              <p className="text-gray-600 text-sm mt-3">Via Stripe Connect, vos loyers sont vires automatiquement sur votre IBAN chaque mois, sans intermediaire.</p>
            </details>
            <details className="bg-white rounded-xl p-5 cursor-pointer border border-gray-100">
              <summary className="font-semibold text-gray-800 list-none flex justify-between items-center">
                Puis-je resilier a tout moment ?
                <span className="text-blue-600 text-xl">+</span>
              </summary>
              <p className="text-gray-600 text-sm mt-3">Oui, proprietaire et locataire peuvent resilier avec un preavis de 15 jours via la messagerie Nestock.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">Pret a commencer ?</h2>
          <p className="text-blue-100 text-lg">Rejoignez Nestock gratuitement et trouvez votre espace de stockage ideal.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/register" className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition text-lg shadow-lg">
              Creer un compte gratuit
            </a>
            <a href="/login" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition text-lg">
              Se connecter
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <p className="text-white font-bold text-lg">Nestock</p>
            <p className="text-xs">La marketplace francaise du stockage entre particuliers.</p>
            <p className="text-xs">contact@tsukee.fr</p>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Produit</p>
            <a href="/about" className="block hover:text-white transition">A propos</a>
            <a href="/contact" className="block hover:text-white transition">Contact</a>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Compte</p>
            <a href="/register" className="block hover:text-white transition">S'inscrire</a>
            <a href="/login" className="block hover:text-white transition">Se connecter</a>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Legal</p>
            <a href="/about" className="block hover:text-white transition">CGU</a>
            <a href="/about" className="block hover:text-white transition">Confidentialite</a>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-xs">
          <p>2025 Nestock - Tous droits reserves</p>
        </div>
      </footer>

    </main>
  )
}
