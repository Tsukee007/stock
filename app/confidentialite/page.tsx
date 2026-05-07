export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-6 space-y-8">

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de Confidentialité</h1>
          <p className="text-gray-500 text-sm">Dernière mise à jour : mai 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 text-sm text-gray-700 leading-relaxed">

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">1 — Responsable du traitement</h2>
            <p>Nestock, accessible à nestock.tsukee.fr, est responsable du traitement de vos données personnelles. Contact : contact@tsukee.fr</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">2 — Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identité : nom, prénom</li>
              <li>Coordonnées : email, téléphone, adresse postale</li>
              <li>Données de connexion : date et heure de connexion</li>
              <li>Données de transaction : montants, dates de paiement</li>
              <li>Contenu généré : annonces, messages, avis</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">3 — Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gérer votre compte et vos locations</li>
              <li>Générer les contrats de location</li>
              <li>Traiter les paiements via Stripe</li>
              <li>Envoyer des notifications et quittances</li>
              <li>Améliorer nos services</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">4 — Base légale</h2>
            <p>Le traitement est fondé sur l'exécution du contrat (article 6.1.b RGPD) pour les données nécessaires à la fourniture du service, et sur votre consentement pour les communications marketing.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">5 — Partage des données</h2>
            <p>Vos données peuvent être partagées avec :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Stripe</strong> : pour le traitement des paiements</li>
              <li><strong>Supabase</strong> : pour le stockage sécurisé des données</li>
              <li>L'autre partie au contrat (propriétaire ou locataire) dans le cadre strict de la location</li>
            </ul>
            <p>Nous ne vendons jamais vos données à des tiers.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">6 — Durée de conservation</h2>
            <p>Vos données sont conservées pendant la durée de votre compte, puis 3 ans après sa suppression pour des raisons légales. Les données de facturation sont conservées 10 ans conformément aux obligations comptables.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">7 — Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>
            <p>Pour exercer ces droits : <a href="mailto:contact@tsukee.fr" className="text-blue-600 hover:underline">contact@tsukee.fr</a></p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">8 — Cookies</h2>
            <p>Nestock utilise uniquement des cookies strictement nécessaires au fonctionnement du service (session d'authentification). Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">9 — Sécurité</h2>
            <p>Vos données sont stockées de manière sécurisée via Supabase, avec chiffrement en transit (HTTPS) et au repos. Les données bancaires sont gérées exclusivement par Stripe (certifié PCI-DSS).</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">10 — Contact et réclamations</h2>
            <p>Pour toute question : <a href="mailto:contact@tsukee.fr" className="text-blue-600 hover:underline">contact@tsukee.fr</a></p>
            <p>Vous pouvez également adresser une réclamation à la CNIL : <a href="https://www.cnil.fr" className="text-blue-600 hover:underline" target="_blank">www.cnil.fr</a></p>
          </div>

        </div>
      </div>
    </div>
  )
}
