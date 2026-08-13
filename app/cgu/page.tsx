export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-gray-500 text-sm">Dernière mise à jour : mai 2026</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 1 - Objet</h2>
            <p>Les présentes CGU régissent l'utilisation de la plateforme Nestock accessible à nestock.pro. En accédant à la plateforme, l'utilisateur accepte sans réserve les présentes CGU.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 2 - Rôle de Nestock</h2>
            <p>Nestock agit en qualité d'intermédiaire entre propriétaires et locataires. Nestock n'est pas partie au contrat de location et ne peut être tenu responsable des litiges entre utilisateurs.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 3 - Commission et frais</h2>
            <p>Nestock perçoit une commission de 10% sur le montant de la location, intégrée dans le prix TTC affiché au locataire. Les frais Stripe sont également inclus. Le propriétaire reçoit exactement le montant qu'il a fixé.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 4 - Contrats de location</h2>
            <p>Les contrats sont générés automatiquement et signés électroniquement. Ils ont valeur juridique conformément à l'article 1366 du Code civil français et au règlement eIDAS.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 5 - Paiements</h2>
            <p>Les paiements sont traités par Stripe, certifié PCI-DSS. Nestock ne stocke aucune donnée bancaire. Les propriétaires reçoivent leurs loyers via Stripe Connect directement sur leur IBAN.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 6 - Obligations</h2>
            <p>Les utilisateurs s'engagent à utiliser la plateforme conformément à la loi, à ne pas stocker de biens illicites ou dangereux, et à respecter les termes des contrats signés.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 7 - Résiliation</h2>
            <p>Tout utilisateur peut résilier son compte à tout moment. Les locations en cours restent soumises aux contrats signés, notamment le préavis de 15 jours.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 8 - Droit applicable</h2>
            <p>Les présentes CGU sont soumises au droit français. Tout litige sera porté devant les tribunaux compétents de France.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Contact</h2>
            <p>contact@nestock.pro</p>
          </div>
        </div>
      </div>
    </div>
  )
}
