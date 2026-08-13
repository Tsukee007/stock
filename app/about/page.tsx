export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-8">

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h1 className="text-3xl font-bold mb-3">À propos de Nestock</h1>
          <p className="text-gray-600 text-lg">L'Airbnb du stockage entre particuliers</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-4">
          <h2 className="text-xl font-bold">Notre mission</h2>
          <p className="text-gray-700 leading-relaxed">Nestock est née d'un constat simple : des milliers de garages, caves et greniers restent inutilisés en France, pendant que des millions de personnes manquent d'espace pour stocker leurs affaires.</p>
          <p className="text-gray-700 leading-relaxed">Notre mission est de connecter ces deux mondes de manière simple, sécurisée et avantageuse pour les deux parties.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl mb-2">🔍</p>
            <h3 className="font-bold mb-2">Trouvez un espace</h3>
            <p className="text-gray-600 text-sm">Recherchez parmi des espaces disponibles près de chez vous</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl mb-2">💬</p>
            <h3 className="font-bold mb-2">Contactez le propriétaire</h3>
            <p className="text-gray-600 text-sm">Échangez directement via notre messagerie sécurisée</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl mb-2">💳</p>
            <h3 className="font-bold mb-2">Payez en sécurité</h3>
            <p className="text-gray-600 text-sm">Paiements sécurisés via Stripe</p>
          </div>
        </div>

        <div className="bg-blue-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Prêt à commencer ?</h2>
          <p className="mb-4 opacity-90" style={{ color: '#ffffff' }}>Rejoignez des milliers d'utilisateurs qui font confiance à Nestock</p>
          <div className="flex gap-3 justify-center">
            <a href="/register" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">Créer un compte</a>
            <a href="/" className="border border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700" style={{ color: '#ffffff' }}>Voir les annonces</a>
          </div>
        </div>

      </div>

      <footer className="bg-white border-t border-gray-100 text-gray-500 py-10 px-4 mt-8">
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
          <p>2026 Nestock - Tous droits réservés</p>
        </div>
      </footer>

    </div>
  )
}
