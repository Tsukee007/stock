export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Generales d Utilisation</h1>
          <p className="text-gray-500 text-sm">Derniere mise a jour : mai 2026</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 1 - Objet</h2>
            <p>Les presentes CGU regissent l utilisation de la plateforme Nestock accessible a nestock.tsukee.fr. En accedant a la plateforme, l utilisateur accepte sans reserve les presentes CGU.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 2 - Role de Nestock</h2>
            <p>Nestock agit en qualite d intermediaire entre proprietaires et locataires. Nestock n est pas partie au contrat de location et ne peut etre tenu responsable des litiges entre utilisateurs.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 3 - Commission et frais</h2>
            <p>Nestock percoit une commission de 10% sur le montant de la location, integree dans le prix TTC affiche au locataire. Les frais Stripe sont egalement inclus. Le proprietaire recoit exactement le montant qu il a fixe.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 4 - Contrats de location</h2>
            <p>Les contrats sont generes automatiquement et signes electroniquement. Ils ont valeur juridique conformement a l article 1366 du Code civil francais et au reglement eIDAS.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 5 - Paiements</h2>
            <p>Les paiements sont traites par Stripe, certifie PCI-DSS. Nestock ne stocke aucune donnee bancaire. Les proprietaires recoivent leurs loyers via Stripe Connect directement sur leur IBAN.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 6 - Obligations</h2>
            <p>Les utilisateurs s engagent a utiliser la plateforme conformement a la loi, a ne pas stocker de biens illicites ou dangereux, et a respecter les termes des contrats signes.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 7 - Resiliation</h2>
            <p>Tout utilisateur peut resilier son compte a tout moment. Les locations en cours restent soumises aux contrats signes, notamment le preavis de 15 jours.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Article 8 - Droit applicable</h2>
            <p>Les presentes CGU sont soumises au droit francais. Tout litige sera porte devant les tribunaux competents de France.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Contact</h2>
            <p>contact@tsukee.fr</p>
          </div>
        </div>
      </div>
    </div>
  )
}
