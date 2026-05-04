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

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', space.owner_id)
    .single()

  let { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('booking_id', bookingId)
    .single()

  if (!contract) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const reference = 'CTRT-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

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
        reference,
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
          {contract?.reference && (
            <p className="text-center text-xs font-mono text-gray-400">Réf. {contract.reference}</p>
          )}
          <hr />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <p className="font-bold text-blue-700">LE PROPRIÉTAIRE</p>
              <p><span className="text-gray-500">Nom :</span> {ownerProfile?.full_name ?? '—'}</p>
              {contract?.owner_birth_date && <p><span className="text-gray-500">Naissance :</span> {new Date(contract.owner_birth_date).toLocaleDateString('fr-FR')}</p>}
              {contract?.owner_phone && <p><span className="text-gray-500">Tél :</span> {contract.owner_phone}</p>}
              {contract?.owner_email && <p><span className="text-gray-500">Email :</span> {contract.owner_email}</p>}
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <p className="font-bold text-blue-700">LE LOCATAIRE</p>
              <p><span className="text-gray-500">Nom :</span> {renter?.full_name ?? '—'}</p>
              {contract?.renter_birth_date && <p><span className="text-gray-500">Naissance :</span> {new Date(contract.renter_birth_date).toLocaleDateString('fr-FR')}</p>}
              {contract?.renter_phone && <p><span className="text-gray-500">Tél :</span> {contract.renter_phone}</p>}
              {contract?.renter_email && <p><span className="text-gray-500">Email :</span> {contract.renter_email}</p>}
            </div>
          </div>

          <hr />

          <div className="space-y-3">
            <div>
              <p className="font-bold">ARTICLE 1 — OBJET</p>
              <p>Location d'un espace de type <strong>{space.type}</strong> situé au <strong>{space.address}, {space.city}</strong>, surface approximative <strong>{space.surface_m2} m²</strong>.</p>
            </div>
            <div>
              <p className="font-bold">ARTICLE 2 — DURÉE</p>
              <p>Prise d'effet le <strong>{new Date(booking.start_date).toLocaleDateString('fr-FR')}</strong>. Reconduction tacite mensuelle avec préavis de <strong>30 jours</strong>.</p>
            </div>
            <div>
              <p className="font-bold">ARTICLE 3 — LOYER</p>
              <p>Loyer : <strong>{space.price_month}€ HT</strong> — Total TTC (frais inclus) : <strong>{Math.round(space.price_month * 1.10)}€</strong>/mois</p>
              <p>Paiement mensuel automatique par prélèvement via Stripe.</p>
            </div>
            <div>
              <p className="font-bold">ARTICLE 4 — OBLIGATIONS</p>
              <p>Le Propriétaire garantit l'accès libre et le bon état de l'espace. Le Locataire s'engage à n'y stocker que des biens licites et non dangereux.</p>
            </div>
            <div>
              <p className="font-bold">ARTICLE 5 — RESPONSABILITÉ</p>
              <p>Le Locataire est seul responsable de l'assurance de ses biens. Nestock intervient uniquement comme intermédiaire.</p>
            </div>
            <div>
              <p className="font-bold">ARTICLE 6 — RÉSILIATION</p>
              <p>Préavis de 30 jours via la messagerie Nestock. Résiliation immédiate possible en cas de manquement grave après mise en demeure de 72h.</p>
            </div>
            <div>
              <p className="font-bold">ARTICLE 7 — DROIT APPLICABLE</p>
              <p>Contrat soumis au droit français. Tout litige porté devant les tribunaux compétents après tentative de médiation.</p>
            </div>
          </div>
        </div>

        {/* Zone de signature */}
        {contract && (
          <ContractSign
            contract={contract}
            isOwner={isOwner}
            isRenter={isRenter}
            bookingId={bookingId}
            spacePrice={Math.round(space.price_month * 1.10)}
          />
        )}

      </div>
    </div>
  )
}