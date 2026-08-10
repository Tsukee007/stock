import { createClient } from '@/lib/supabase/server'
import SearchFilters from '@/components/map/SearchFilters'
import MapWithList from '@/components/map/MapWithList'
import FAQSection from '@/components/FAQSection'
import FeatureShowcase from '@/components/FeatureShowcase'

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
    .select('id, title, city, lat, lng, price_month, type, surface_m2, address, price_ttc, bookings(status), profiles(full_name)')
    .eq('is_active', true)

  if (filters.city && !filters.lat) query = query.ilike('city', `%${filters.city}%`)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.minPrice) query = query.gte('price_month', parseFloat(filters.minPrice))
  if (filters.maxPrice) query = query.lte('price_month', parseFloat(filters.maxPrice))
  if (filters.minSurface) query = query.gte('surface_m2', parseFloat(filters.minSurface))

  let { data: rawSpaces } = await query
  let spaces = rawSpaces?.map(s => ({
    ...s,
    is_booked: (s.bookings as any[])?.some((b: any) => ['active', 'confirmed', 'awaiting_signature'].includes(b.status)) ?? false,
    profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
  }))

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

      {/* Hero */}
      <section className="bg-white py-16 md:py-24 px-4 border-b border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center md:text-left">
            <div className="inline-block text-sm px-4 py-2 rounded-full font-semibold" style={{ background: '#FAECE7', color: '#712B13' }}>
              L'Airbnb du stockage entre particuliers
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              Le garage de votre voisin vaut mieux qu'un box en zone industrielle
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto md:mx-0">
              Nestock connecte les particuliers qui ont de la place et ceux qui en cherchent.
              Moins cher qu'un self-stockage, à quelques minutes de chez vous, avec contrat et paiement sécurisés.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-2">
              <a href="/register" className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition text-lg shadow-sm" style={{ color: '#ffffff' }}>
                Trouver un espace
              </a>
              <a href="/register" className="border border-gray-200 text-gray-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition text-lg">
                Louer mon espace
              </a>
            </div>
            <p className="text-gray-400 text-sm">Inscription gratuite - Aucun frais caché - Contrat inclus</p>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img
                src="/images/hero-garage.jpg"
                alt="Garage privé rangé, disponible à la location sur Nestock"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto bg-white rounded-2xl shadow-lg px-5 py-4 max-w-xs">
              <p className="text-xs text-gray-400 mb-1">Exemple d'annonce</p>
              <p className="font-semibold text-gray-900 text-sm">Garage · 12 m³</p>
              <p className="text-blue-600 font-bold text-lg">68 €/mois</p>
            </div>
          </div>
        </div>
      </section>

      {/* Apercu carte */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Espaces disponibles près de chez vous</h2>
          <p className="text-gray-500 text-sm mt-1">Inscrivez-vous gratuitement pour contacter les propriétaires et réserver.</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-gray-200" style={{ height: '500px' }}>
          <SearchFilters initialFilters={filters} />
          <div className="h-full pt-14">
            <MapWithList spaces={spaces ?? []} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <a href="/register" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-blue-700 transition whitespace-nowrap text-lg" style={{ color: '#ffffff' }}>
              S'inscrire gratuitement pour réserver
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-b border-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold text-gray-900">{spaces?.length ?? 0}+</p>
            <p className="text-gray-500 text-sm mt-1">Espaces disponibles</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-gray-900">100%</p>
            <p className="text-gray-500 text-sm mt-1">Contrats sécurisés</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-gray-900">0 euro</p>
            <p className="text-gray-500 text-sm mt-1">Inscription gratuite</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-gray-900">15j</p>
            <p className="text-gray-500 text-sm mt-1">Préavis de résiliation</p>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Comment louer un espace ?</h2>
            <p className="text-gray-500 mt-2">En quelques étapes simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-3 border border-gray-100">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">1</div>
              <div className="text-4xl">🔍</div>
              <h3 className="font-bold text-gray-800">Recherchez</h3>
              <p className="text-gray-500 text-sm">Parcourez les annonces sur la carte. Filtrez par ville, type et prix.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-3 border border-gray-100">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">2</div>
              <div className="text-4xl">📩</div>
              <h3 className="font-bold text-gray-800">Demandez</h3>
              <p className="text-gray-500 text-sm">Envoyez une demande de réservation avec votre date souhaitée.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-3 border border-gray-100">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">3</div>
              <div className="text-4xl">✍️</div>
              <h3 className="font-bold text-gray-800">Signez</h3>
              <p className="text-gray-500 text-sm">Signez le contrat électronique directement sur la plateforme.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-3 border border-gray-100">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">4</div>
              <div className="text-4xl">🔑</div>
              <h3 className="font-bold text-gray-800">Stockez</h3>
              <p className="text-gray-500 text-sm">Paiement automatique chaque mois. Résiliez avec 15j de préavis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Valeurs */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-500 text-white text-sm px-4 py-1.5 rounded-full font-medium mb-6" style={{ color: '#ffffff' }}>
            Notre vision
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white leading-snug mb-16 max-w-2xl mx-auto" style={{ color: '#ffffff' }}>
            Il existe déjà assez d'espace en France, il suffit de mieux le partager.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            <div>
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-bold text-white mb-2" style={{ color: '#ffffff' }}>Proximité</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Des solutions de stockage à deux pas de chez vous, portées par des particuliers de votre quartier.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-bold text-white mb-2" style={{ color: '#ffffff' }}>Confiance</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Contrats, paiements et suivi gérés de bout en bout, pour louer et proposer un espace en toute sérénité.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">💶</div>
              <h3 className="font-bold text-white mb-2" style={{ color: '#ffffff' }}>Accessibilité</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Un stockage jusqu'à deux fois moins cher qu'un box traditionnel.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-bold text-white mb-2" style={{ color: '#ffffff' }}>Impact local</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Valoriser les espaces inutilisés plutôt que d'en construire de nouveaux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalites */}
      <FeatureShowcase />

      {/* Pour les propriétaires */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded-full font-medium">
                Pour les propriétaires
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Votre espace inutilisé peut vous rapporter</h2>
              <p className="text-gray-600">Garage vide, cave disponible ? Louez-le et générez des revenus passifs chaque mois.</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ Annonce gratuite et rapide à créer</p>
                <p>✓ Contrat électronique automatique</p>
                <p>✓ Paiement sécurisé via Stripe Connect</p>
                <p>✓ Virements directs sur votre IBAN</p>
                <p>✓ Vous fixez votre prix, vous gardez tout</p>
              </div>
              <a href="/register" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition" style={{ color: '#ffffff' }}>
                Déposer mon annonce gratuitement
              </a>
            </div>
            <div className="bg-white rounded-2xl p-8 space-y-4 border border-gray-100 shadow-sm">
              <p className="font-bold text-gray-700 text-center mb-4">Simulateur de revenus</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Votre prix</span>
                  <span className="font-bold text-gray-900">100 euros/mois</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Commission Nestock (10%)</span>
                  <span className="text-gray-600">+ 10 euros</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Frais Stripe</span>
                  <span className="text-gray-600">+ 1.75 euros</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-900">Locataire paie</span>
                  <span className="font-bold text-gray-900">111.75 euros/mois</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-gray-900">Vous recevez</span>
                  <span className="font-bold text-blue-600">100 euros/mois ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Pourquoi choisir Nestock ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
              <span className="text-3xl">🛡️</span>
              <div>
                <h3 className="font-bold text-gray-900">Contrats légaux</h3>
                <p className="text-gray-500 text-sm mt-1">Contrats conformes au droit français, signés électroniquement (article 1366 du Code civil).</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
              <span className="text-3xl">💳</span>
              <div>
                <h3 className="font-bold text-gray-900">Paiements sécurisés</h3>
                <p className="text-gray-500 text-sm mt-1">Paiements automatiques traites par Stripe (certifie PCI-DSS niveau 1). Proprietaire paye sur son IBAN chaque mois.</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
              <span className="text-3xl">📍</span>
              <div>
                <h3 className="font-bold text-gray-900">Carte interactive</h3>
                <p className="text-gray-500 text-sm mt-1">Visualisez tous les espaces disponibles sur une carte. Filtrez par distance, prix et surface.</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
              <span className="text-3xl">📄</span>
              <div>
                <h3 className="font-bold text-gray-900">Quittances automatiques</h3>
                <p className="text-gray-500 text-sm mt-1">Une quittance de loyer est générée et envoyée par email après chaque paiement mensuel.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Réassurance Stripe */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <svg width="52" height="22" viewBox="0 0 60 25" fill="#635BFF">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V6.27h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 6.9-5.65 6.9zm-.95-9.99c-.93 0-1.48.35-1.96.8l.02 6.12c.45.4.98.7 1.94.7 1.49 0 2.48-1.61 2.48-3.79 0-2.13-1-3.83-2.48-3.83zM28.24 5.07c1.36 0 2.2-.88 2.2-2.03C30.44.97 29.6 0 28.24 0c-1.35 0-2.2.97-2.2 2.04 0 1.15.85 2.03 2.2 2.03zm2.07 15.22h-4.17V6.27h4.17v14.02zM21.77 7l-.27-1.44h-3.7v14.47h4.1v-9.86c.92-1.2 2.47-1 2.95-.84V6.27c-.5-.18-2.27-.44-3.08.73zM12.15 6.27l-.1.57c-.72-.8-2.07-1.07-3.43-1.07C5.15 5.77 3 8.3 3 11.03c0 3.2 2.01 4.86 4.62 4.86 1.28 0 2.43-.37 3.13-.98v.48c0 1.77-.96 2.73-3.02 2.73-1.48 0-2.87-.47-3.82-1.03l-.01 3.39c1.05.46 2.62.79 4.17.79 3.88 0 6.64-1.85 6.64-6.48V6.27h-2.56zm-2.98 7.3c-1.18 0-1.95-.77-1.95-2.07 0-1.27.77-2.07 1.95-2.07 1.17 0 1.92.8 1.92 2.07 0 1.3-.75 2.07-1.92 2.07z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Vos paiements protégés par Stripe</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-12">
            Nestock ne gère jamais vos données bancaires directement. Chaque transaction passe par Stripe,
            l'infrastructure de paiement utilisée par des millions d'entreprises dans le monde, des plus petites
            startups aux plus grandes plateformes internationales.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Certifié PCI-DSS niveau 1</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Stripe détient le plus haut niveau de certification pour le traitement sécurisé des paiements par carte.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Vos données ne transitent jamais par Nestock</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Numéro de carte, IBAN : tout est traité directement par Stripe, chiffré de bout en bout.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m0 16v1m8.485-8.485h-1M4.515 12h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Reconnu mondialement</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Stripe équipe des entreprises de toutes tailles à travers le monde, de la startup aux plus grandes plateformes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* CTA final */}
      <section className="bg-gray-50 border-t border-gray-100 py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Prêt à commencer ?</h2>
          <p className="text-gray-500 text-lg">Rejoignez Nestock gratuitement et trouvez votre espace de stockage idéal.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/register" className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition text-lg shadow-sm" style={{ color: '#ffffff' }}>
              Créer un compte gratuit
            </a>
            <a href="/login" className="border border-gray-200 text-gray-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition text-lg">
              Se connecter
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 text-gray-500 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <p className="text-gray-900 font-bold text-lg">Nestock</p>
            <p className="text-xs text-gray-400">L'Airbnb du stockage entre particuliers.</p>
            <p className="text-xs text-gray-400">contact@nestock.pro</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Produit</p>
            <a href="/about" className="block hover:text-gray-900 transition">À propos</a>
            <a href="/contact" className="block hover:text-gray-900 transition">Contact</a>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Compte</p>
            <a href="/register" className="block hover:text-gray-900 transition">S'inscrire</a>
            <a href="/login" className="block hover:text-gray-900 transition">Se connecter</a>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Légal</p>
<a href="/cgu" className="block hover:text-gray-900 transition">CGU</a>
<a href="/confidentialite" className="block hover:text-gray-900 transition">Confidentialité</a>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>2025 Nestock - Tous droits réservés</p>
        </div>
      </footer>

    </main>
  )
}
