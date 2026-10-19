import { CGU_DATE, CGU_VERSION } from '@/lib/preuves'

const articles: { title: string; paragraphs: string[] }[] = [
  {
    title: 'Article 1 - Objet',
    paragraphs: [
      "Les présentes CGU régissent l'utilisation de la plateforme Nestock accessible à nestock.pro. Leur acceptation est demandée à la création du compte, puis à chaque signature d'un contrat de location. La version acceptée, la date, l'adresse IP et le navigateur utilisés sont enregistrés.",
    ],
  },
  {
    title: 'Article 2 - Rôle de Nestock',
    paragraphs: [
      "Nestock agit en qualité d'intermédiaire technique entre propriétaires et locataires : il met en relation les utilisateurs, génère le contrat et encaisse les loyers pour le compte du propriétaire. Nestock n'est pas partie au contrat de location.",
      "Nestock n'est pas responsable des litiges entre propriétaires et locataires, notamment sur l'état de l'espace, l'accès, les biens stockés, leur perte, leur vol ou leur dégradation, ni du respect par chacun de ses engagements. Ces litiges se règlent directement entre les parties. Nestock peut, sans y être tenu, transmettre aux parties les éléments dont il dispose (contrat, messages, paiements).",
      "Le locataire reste seul responsable des biens qu'il stocke ; il lui appartient de les assurer s'il le souhaite.",
    ],
  },
  {
    title: 'Article 3 - Commission et frais',
    paragraphs: [
      'Nestock perçoit une commission de 10 % sur le loyer fixé par le propriétaire. Les frais de paiement Stripe sont à la charge du locataire. Commission et frais sont intégrés dans le prix TTC affiché au locataire. Le propriétaire reçoit exactement le loyer qu\'il a fixé.',
    ],
  },
  {
    title: 'Article 4 - Contrats de location',
    paragraphs: [
      "Les contrats sont générés automatiquement et signés électroniquement. Ils ont valeur juridique conformément à l'article 1366 du Code civil français et au règlement eIDAS. Pour chaque signature, Nestock conserve la date, le nom saisi, l'adresse IP, le navigateur et la version des CGU acceptée.",
    ],
  },
  {
    title: 'Article 5 - Paiements',
    paragraphs: [
      "Les paiements sont traités par Stripe, certifié PCI-DSS. Nestock ne stocke aucune donnée bancaire.",
      "Le loyer est prélevé automatiquement le 1er de chaque mois pour le mois entier. Le premier paiement, fait à la fin de la signature du contrat, couvre les jours restants du mois en cours, au prorata. La location démarre une fois ce premier paiement reçu.",
      "Le locataire ne doit pas arrêter lui-même son abonnement auprès de Stripe : la fin de la location passe par le préavis prévu à l'article 7.",
    ],
  },
  {
    title: 'Article 6 - Compte de paiement du propriétaire',
    paragraphs: [
      "Pour recevoir ses loyers, le propriétaire doit ouvrir un compte de paiement Stripe depuis Nestock et en terminer l'inscription (identité, IBAN, acceptation des conditions Stripe). Tant que ce compte n'est pas actif, le propriétaire peut recevoir des demandes de réservation, mais ne peut ni signer de contrat ni encaisser de loyer.",
      "Chaque loyer payé par le locataire est reversé au propriétaire sur son compte Stripe, puis viré sur son IBAN par Stripe une fois le paiement du locataire définitivement encaissé, en général sous quelques jours.",
    ],
  },
  {
    title: 'Article 7 - Préavis et fin de la location',
    paragraphs: [
      "Le locataire comme le propriétaire peut mettre fin à la location à tout moment depuis son tableau de bord, avec un préavis de 15 jours minimum. La date de la demande est enregistrée.",
      "La location se termine toujours le dernier jour d'un mois : si le préavis est donné jusqu'au 15 du mois inclus, la location prend fin le dernier jour du mois en cours ; s'il est donné après le 15, elle prend fin le dernier jour du mois suivant. Aucun prélèvement n'a lieu après la fin de la location.",
    ],
  },
  {
    title: 'Article 8 - Mois entamé',
    paragraphs: [
      "Tout mois prélevé est dû en entier, y compris le dernier mois de la location : aucun remboursement au prorata n'est effectué en cas de résiliation, puisque la location se termine toujours à la fin d'un mois payé. Le loyer de chaque mois est reversé au propriétaire.",
    ],
  },
  {
    title: 'Article 9 - Contestation de paiement',
    paragraphs: [
      "Si un locataire conteste un paiement auprès de sa banque et que la contestation est tranchée en sa faveur, Nestock peut reprendre au propriétaire la part de loyer qui lui avait été reversée pour ce paiement, sur son compte Stripe ou sur les loyers suivants. Nestock transmet à la banque les éléments de preuve dont il dispose (contrat signé, paiements, messages, résiliation).",
    ],
  },
  {
    title: 'Article 10 - Obligations',
    paragraphs: [
      "Les utilisateurs s'engagent à utiliser la plateforme conformément à la loi, à ne pas stocker de biens illicites ou dangereux, et à respecter les termes des contrats signés.",
    ],
  },
  {
    title: 'Article 11 - Suppression du compte',
    paragraphs: [
      "Tout utilisateur peut demander la suppression de son compte à tout moment. Les locations en cours restent soumises aux contrats signés, notamment le préavis de 15 jours.",
    ],
  },
  {
    title: 'Article 12 - Droit applicable',
    paragraphs: [
      'Les présentes CGU sont soumises au droit français. Tout litige sera porté devant les tribunaux compétents de France.',
    ],
  },
]

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-gray-500 text-sm">Version du {CGU_DATE} (réf. {CGU_VERSION})</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
          {articles.map(a => (
            <div key={a.title} className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">{a.title}</h2>
              {a.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          ))}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Contact</h2>
            <p>contact@nestock.pro</p>
          </div>
        </div>
      </div>
    </div>
  )
}
