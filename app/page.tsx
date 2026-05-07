python3 << 'PYEOF'
content = """import { createClient } from '@/lib/supabase/server'
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block bg-blue-600 text-blue-100 text-sm px-4 py-1.5 rounded-full font-medium">
            🇫🇷 La marketplace française du stockage entre particuliers
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Trouvez ou louez un espace<br />
            <span className="text-blue-300">de stockage près de chez vous</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Caves, garages, boxes, greniers... Nestock connecte propriétaires et locataires
            pour des locations simples, sécurisées et avec contrat électronique.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a href="/register"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition text-lg shadow-lg">
              🔍 Trouver un espace
            </a>
            <a href="/register"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition text-lg">
              💰 Louer mon espace
            </a>
          </div>
          <p className="text-blue-200 text-sm">Inscription gratuite · Aucun frais caché · Contrat inclus</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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
            <p className="text-gray-500 text-sm mt-1">Inscription gratuite</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-blue-600">15j</p>
            <p className="text-gray-500 text-sm mt-1">Préavis de résiliation</p>
          </div>
        </div>
      </section>

      {/* Comment ça marche - Locataire */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Comment louer un espace ?</h2>
            <p className="text-gray-500 mt-2">En quelques étapes simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '🔍', step: '1', title: 'Recherchez', desc: 'Parcourez les annonces sur la carte. Filtrez par ville, type et prix.' },
              { icon: '📩', step: '2', title: 'Demandez', desc: 'Envoyez une demande de réservation avec votre date souhaitée.' },
              { icon: '✍️', step: '3', title: 'Signez', desc: 'Signez le contrat électronique directement sur la plateforme.' },
              { icon: '🔑', step: '4', title: 'Stockez', desc: 'Paiement automatique chaque mois. Résiliez à tout moment avec 15j de préavis.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3 relative">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">
                  {item.step}
                </div>
                <div className="text-4xl">{item.icon}</div>
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour les propriétaires */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-green-100 text-green-700 text-sm px-4 py-1.5 rounded-full font-medium">
                💰 Pour les propriétaires
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Votre espace inutilisé peut vous rapporter
              </h2>
              <p className="text-gray-600">
                Garage vide, cave disponible, grenier encombré ? Louez-le et générez des revenus
                passifs chaque mois, sans effort.
              </p>
              <div className="space-y-3">
                {[
                  '✅ Annonce gratuite et rapide à créer',
                  '✅ Contrat électronique automatique',
                  '✅ Paiement sécurisé via Stripe Connect',
                  '✅ Virements directs sur votre IBAN',
                  '✅ Vous fixez votre prix, vous gardez tout',
                ].map(item => (
                  <p key={item} className="text-gray-700 text-sm">{item}</p>
                ))}
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Exemple de revenus :</p>
                <p className="text-2xl font-bold text-green-600 mt-1">100€/mois</p>
                <p className="text-xs text-gray-500">pour un garage de 20m² → vous recevez 100€ net</p>
              </div>
              <a href="/register"
                className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition">
                Déposer mon annonce gratuitement
              </a>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 space-y-4">
              <p className="font-bold text-gray-700 text-center mb-4">Simulateur de revenus</p>
              <div className="bg-white rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Votre prix</span>
                  <span className="font-bold">100€/mois</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Commission Nestock (10%)</span>
                  <span>+ 10€</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Frais Stripe (~1.5%)</span>
                  <span>+ 1.75€</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-blue-700">
                  <span>Locataire paie</span>
                  <span>111.75€/mois</span>
                </div>
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Vous recevez</span>
                  <span>100€/mois ✅</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Transparence totale — vous fixez votre prix et recevez exactement ce montant
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Pourquoi choisir Nestock ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '🛡️', title: 'Contrats légaux', desc: 'Contrats conformes au droit français, signés électroniquement (article 1366 du Code civil). Valeur juridique garantie.' },
              { icon: '💳', title: 'Paiements sécurisés', desc: 'Paiements automatiques via Stripe, certifié PCI-DSS. Propriétaire payé directement sur son IBAN chaque mois.' },
              { icon: '📍', title: 'Carte interactive', desc: 'Visualisez tous les espaces disponibles sur une carte. Filtrez par distance, prix, surface et type.' },
              { icon: '📱', title: '100% digital', desc: 'Tout depuis votre téléphone : recherche, réservation, signature, paiement et messagerie intégrée.' },
              { icon: '🔔', title: 'Notifications temps réel', desc: 'Soyez alerté instantanément des nouvelles demandes, messages et paiements via les notifications.' },
              { icon: '📄', title: 'Quittances automatiques', desc: 'Une quittance de loyer est générée et envoyée par email après chaque paiement mensuel.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-white hover:border-blue-100 hover:bg-blue-50/30 transition">
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

      {/* Apercu carte */}
      <section className="py-12 px-4 bg-white border-t">
        <div className="max-w-5xl mx-auto mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Espaces disponibles près de chez vous</h2>
          <p className="text-gray-500 text-sm mt-1">
            Inscrivez-vous gratuitement pour contacter les propriétaires et réserver.
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden" style={{ height: '500px' }}>
          <SearchFilters initialFilters={filters} />
          <div className="h-full pt-14">
            <MapWithList spaces={spaces ?? []} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <a href="/register"
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition whitespace-nowrap text-lg">
              S'inscrire gratuitement pour réserver →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Est-ce que Nestock est gratuit ?', a: "L'inscription est entièrement gratuite. Nestock prend une commission de 10% uniquement sur les transactions réalisées, intégrée dans le prix affiché au locataire." },
              { q: 'Le contrat est-il légalement valide ?', a: "Oui. Les contrats signés sur Nestock ont la même valeur juridique qu'une signature manuscrite, conformément à l'article 1366 du Code civil français et au règlement eIDAS." },
              { q: 'Comment je reçois mon argent en tant que propriétaire ?', a: "Via Stripe Connect, vos loyers sont virés automatiquement sur votre IBAN chaque mois, sans intermédiaire." },
              { q: 'Puis-je résilier à tout moment ?', a: "Oui, propriétaire et locataire peuvent résilier avec un préavis de 15 jours via la messagerie Nestock." },
              { q: 'Que se passe-t-il si le locataire ne paie pas ?', a: "Stripe gère les relances automatiques (3 tentatives). En cas d'échec, vous êtes notifié et pouvez résilier le contrat." },
            ].map((item, i) => (
              <details key={i} className="bg-white rounded-xl p-5 group cursor-pointer border border-gray-100">
                <summary className="font-semibold text-gray-800 list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-blue-600 text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">Prêt à commencer ?</h2>
          <p className="text-blue-100 text-lg">
            Rejoignez Nestock gratuitement et trouvez votre espace de stockage idéal,
            ou monétisez l'espace inutilisé chez vous.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/register"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition text-lg shadow-lg">
              Créer un compte gratuit
            </a>
            <a href="/login"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition text-lg">
              Se connecter
            </a>
          </div>
          <p className="text-blue-200 text-sm">Aucune carte bancaire requise · Gratuit pour toujours</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <p className="text-white font-bold text-lg">🗄️ Nestock</p>
            <p className="text-xs">La marketplace française du stockage entre particuliers.</p>
            <p className="text-xs">contact@tsukee.fr</p>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Produit</p>
            <a href="/about" className="block hover:text-white transition">À propos</a>
            <a href="/contact" className="block hover:text-white transition">Contact</a>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Compte</p>
            <a href="/register" className="block hover:text-white transition">S'inscrire</a>
            <a href="/login" className="block hover:text-white transition">Se connecter</a>
            <a href="/spaces/new" className="block hover:text-white transition">Déposer une annonce</a>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Légal</p>
            <a href="/about" className="block hover:text-white transition">CGU</a>
            <a href="/about" className="block hover:text-white transition">Confidentialité</a>
            <a href="/about" className="block hover:text-white transition">Mentions légales</a>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-xs">
          <p>© {new Date().getFullYear()} Nestock — Tous droits réservés</p>
        </div>
      </footer>

    </main>
  )
}
"""
with open('app/page.tsx', 'w') as f:
    f.write(content)
print('Done')
PYEOF