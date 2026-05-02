import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ContractSign from '@/components/ui/ContractSign'

export default async function ContractPage({
  params
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, spaces(title, address, city, surface_m2, type, price_month, owner_id), profiles!bookings_renter_id_fkey(full_name, avatar_url)')
    .eq('id', bookingId)
    .single()

  if (!booking) notFound()

  const space = booking.spaces as any
  const renter = booking.profiles as any

  // Récupérer le profil du propriétaire
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', space.owner_id)
    .single()

  // Récupérer ou créer le contrat
  let { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('booking_id', bookingId)
    .single()

  if (!contract) {
    const { data: newContract } = await supabase
      .from('contracts')
      .insert({
        booking_id: bookingId,
        space_id: booking.space_id,
        owner_id: space.owner_id,
        renter_id: booking.renter_id,
        loyer_ht: space.price_month,
        loyer_ttc: Math.round(space.price_month * 1.10 * 100) / 100,
        date_debut: booking.start_date,
      })
      .select()
      .single()
    contract = newContract
  }

  const isOwner = user.id === space.owner_id
  const isRenter = user.id === booking.renter_id

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-500 hover:text-blue-600">← Dashboard</a>
          <h1 className="text-xl font-bold">📄 Contrat de location</h1>
        </div>

        {/* Statut */}
        <div className={`rounded-xl p-4 text-center font-semibold ${
          contract?.status === 'fully_signed' ? 'bg-green-50 text-green-700' :
          contract?.status === 'owner_signed' ? 'bg-yellow-50 text-yellow-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {contract?.status === 'fully_signed' && '✅ Contrat signé par les deux parties'}
          {contract?.status === 'owner_signed' && '⏳ En attente de la signature du locataire'}
          {contract?.status === 'pending' && '📝 En attente de la signature du propriétaire'}
        </div>

        {/* Contenu du contrat */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 text-sm">
          <h2 className="text-xl font-bold text-center text-blue-600">CONTRAT DE LOCATION D'ESPACE DE STOCKAGE</h2>
          <p className="text-center text-gray-500">Via la plateforme Nestock — nestock.tsukee.fr</p>

          <hr />

          <div className="space-y-2">
            <p className="font-bold">ENTRE LES SOUSSIGNES :</p>
            <p><span className="font-semibold">Le Propriétaire :</span> {ownerProfile?.full_name ?? 'Non renseigné'}</p>
            <p><span className="font-semibold">Le Locataire :</span> {renter?.full_name ?? 'Non renseigné'}</p>
          </div>

          <hr />

          <div className="space-y-2">
            <p className="font-bold">ARTICLE 1 — OBJET</p>
            <p>Location d'un espace de stockage de type <strong>{space.type}</strong> situé au <strong>{space.address}, {space.city}</strong>, d'une surface approximative de <strong>{space.surface_m2} m²</strong>.</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold">ARTICLE 2 — DURÉE</p>
            <p>Le contrat prend effet le <strong>{new Date(booking.start_date).toLocaleDateString('fr-FR')}</strong> et se reconduit tacitement chaque mois jusqu'à résiliation par l'une des parties avec un préavis de <strong>30 jours</strong>.</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold">ARTICLE 3 — LOYER</p>
            <p>Loyer mensuel : <strong>{space.price_month}€ HT</strong></p>
            <p>Total facturé au locataire (frais de service inclus) : <strong>{Math.round(space.price_month * 1.10)}€ TTC</strong></p>
            <p>Paiement mensuel automatique par prélèvement via Stripe.</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold">ARTICLE 4 — OBLIGATIONS</p>
            <p>Le Propriétaire garantit l'accès libre à l'espace et son bon état. Le Locataire s'engage à n'y stocker que des biens licites et non dangereux, et à restituer l'espace en bon état.</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold">ARTICLE 5 — RESPONSABILITÉ</p>
            <p>Le Locataire est seul responsable de l'assurance de ses biens. Nestock intervient uniquement comme intermédiaire et ne peut être tenu responsable des litiges entre les parties.</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold">ARTICLE 6 — RÉSILIATION</p>
            <p>Chaque partie peut résilier le contrat avec un préavis de 30 jours via la messagerie Nestock. En cas de manquement grave, résiliation immédiate possible après mise en demeure de 72h.</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold">ARTICLE 7 — DROIT APPLICABLE</p>
            <p>Contrat soumis au droit français. Tout litige sera porté devant les tribunaux compétents après tentative de médiation amiable.</p>
          </div>
        </div>

        {/* Zone de signature */}
        {contract && (
          <ContractSign
            contract={contract}
            isOwner={isOwner}
            isRenter={isRenter}
            bookingId={bookingId}
          />
        )}

      </div>
    </div>
  )
}