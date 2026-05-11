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
    .select('*, spaces(title, address, city, surface_m2, type, price_month, price_ttc, owner_id, access_24h), profiles!bookings_renter_id_fkey(full_name, address, city, postal_code, phone)')
    .eq('id', bookingId)
    .single()

  if (!booking) notFound()

  const space = booking.spaces as any
  const renter = booking.profiles as any

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name, address, city, postal_code, phone')
    .eq('id', space.owner_id)
    .single()

  const adminSupabase = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: ownerAuth } = await adminSupabase.auth.admin.getUserById(space.owner_id)
  const { data: renterAuth } = await adminSupabase.auth.admin.getUserById(booking.renter_id)
  const ownerEmail = ownerAuth?.user?.email ?? '—'
  const renterEmail = renterAuth?.user?.email ?? '—'

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
        loyer_ttc: space.price_ttc ?? Math.round(space.price_month * 1.10 * 1.015 * 100 + 25) / 100,
        date_debut: booking.start_date,
      })
      .select()
      .single()
    contract = newContract
  }

  const isOwner = user.id === space.owner_id
  const isRenter = user.id === booking.renter_id

  // Verifier si le profil de l'utilisateur connecte est complet
  const currentProfile = isOwner ? ownerProfile : renter
  const profileIncomplete = !currentProfile?.full_name || !currentProfile?.address || !currentProfile?.phone

  const formatDate = (date: string) => {
    if (!date) return '__ / __ / ____'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-500 hover:text-blue-600">← Dashboard</a>
          <h1 className="text-xl font-bold">📄 Contrat de location</h1>
        </div>

        {/* Alerte profil incomplet */}
        {profileIncomplete && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-red-700">⚠️ Profil incomplet</p>
            <p className="text-sm text-red-600">Vos informations personnelles sont incompletes. Vous devez completer votre profil avant de pouvoir signer ce contrat.</p>
            <a href="/profile" className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
              Completer mon profil →
            </a>
          </div>
        )}

        {/* Statut */}
        <div className={`rounded-xl p-4 text-center font-semibold ${
          contract?.status === 'fully_signed' ? 'bg-green-50 text-green-700' :
          contract?.status === 'owner_signed' ? 'bg-yellow-50 text-yellow-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {contract?.status === 'fully_signed' && '✅ Contrat signé par les deux parties'}
          {contract?.status === 'owner_signed' && '⏳ En attente de la signature du locataire'}
          {contract?.status === 'pending' && '📝 En attente de la signature du bailleur'}
          {contract?.reference && (
            <p className="text-sm mt-1 font-normal">Réf. {contract.reference}</p>
          )}
        </div>

        {/* Contrat */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 space-y-6 text-sm">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold uppercase">Contrat de location d'un espace de stockage entre particuliers</h2>
            <p className="text-gray-500 text-xs">Via la plateforme Nestock — nestock.tsukee.fr</p>
          </div>

          <hr />

          {/* Parties */}
          <div>
            <p className="font-bold text-center mb-4">ENTRE LES SOUSSIGNÉS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 space-y-2">
                <p className="font-bold text-blue-700">Le Bailleur</p>
                <p><span className="text-gray-500">Nom / Prénom :</span> {ownerProfile?.full_name ?? '—'}</p>
                <p><span className="text-gray-500">Adresse :</span> {ownerProfile?.address ? ownerProfile.address + ', ' + ownerProfile.postal_code + ' ' + ownerProfile.city : '—'}</p>
                <p><span className="text-gray-500">Téléphone :</span> {contract?.owner_phone ?? ownerProfile?.phone ?? '—'}</p>
                <p><span className="text-gray-500">E-mail (profil) :</span> {ownerEmail}</p>
                <p><span className="text-gray-500">E-mail (signature) :</span> {contract?.owner_email ?? '—'}</p>
                {contract?.owner_signed && (
                  <p className="text-green-600 text-xs">✅ Signé le {formatDate(contract.owner_signed_at)}</p>
                )}
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <p className="font-bold text-blue-700">Le Locataire</p>
                <p><span className="text-gray-500">Nom / Prénom :</span> {renter?.full_name ?? '—'}</p>
                <p><span className="text-gray-500">Adresse :</span> {renter?.address ? renter.address + ', ' + renter.postal_code + ' ' + renter.city : '—'}</p>
                <p><span className="text-gray-500">Téléphone :</span> {contract?.renter_phone ?? renter?.phone ?? '—'}</p>
                <p><span className="text-gray-500">E-mail (profil) :</span> {renterEmail}</p>
                <p><span className="text-gray-500">E-mail (signature) :</span> {contract?.renter_email ?? '—'}</p>
                {contract?.renter_signed && (
                  <p className="text-green-600 text-xs">✅ Signé le {formatDate(contract.renter_signed_at)}</p>
                )}
              </div>
            </div>
          </div>

          <hr />

          {/* Articles */}
          <div className="space-y-5">
            <div>
              <p className="font-bold">ARTICLE 1 — OBJET DU CONTRAT</p>
              <p className="mt-1 text-gray-700">Le Bailleur met à disposition du Locataire un espace de stockage situé à l'adresse suivante :</p>
              <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-1">
                <p><span className="text-gray-500">Adresse :</span> <strong>{space.address}, {space.city}</strong></p>
                <p><span className="text-gray-500">Type :</span> <strong className="capitalize">{space.type}</strong></p>
                <p><span className="text-gray-500">Surface :</span> <strong>{space.surface_m2} m²</strong></p>
                <p><span className="text-gray-500">Accès :</span> <strong>{space.access_24h ? '24h/24' : 'Horaires normaux'}</strong></p>
              </div>
              <p className="mt-2 text-gray-700">Cet espace est destiné exclusivement au stockage de biens personnels du Locataire.</p>
            </div>

            <div>
              <p className="font-bold">ARTICLE 2 — DURÉE DE LA LOCATION</p>
              <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-1">
                <p>☑ Indéterminée à compter du <strong>{formatDate(booking.start_date)}</strong></p>
                <p>Préavis de résiliation : <strong>30 jours</strong>, transmis par écrit via la messagerie Nestock.</p>
              </div>
            </div>

            <div>
              <p className="font-bold">ARTICLE 3 — LOYER</p>
              <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-1">
                <p>Prix propriétaire (HT) : <strong>{Number(space.price_month).toFixed(2)}€/mois</strong></p>
                    <p>Commission Nestock (10%) : <strong>{(space.price_month * 0.10).toFixed(2)}€/mois</strong></p>
                    <p>Frais Stripe (~1.5% + 0.25€) : <strong>{(space.price_ttc - space.price_month - space.price_month * 0.10).toFixed(2)}€/mois</strong></p>
                    <p>Montant total TTC : <strong>{Number(space.price_ttc).toFixed(2)}€ par mois</strong></p>
                <p>Paiement : <strong>par prélèvement automatique via Stripe</strong></p>
                <p>Date de prélèvement : <strong>le {new Date(booking.start_date).getDate()} de chaque mois</strong></p>
              </div>
            </div>

            <div>
              <p className="font-bold">ARTICLE 4 — DÉPÔT DE GARANTIE</p>
              <p className="mt-1 text-gray-700">Aucun dépôt de garantie n'est requis dans le cadre de cette location via la plateforme Nestock.</p>
            </div>

            <div>
              <p className="font-bold">ARTICLE 5 — UTILISATION DE L'ESPACE</p>
              <p className="mt-1 text-gray-700">Le Locataire s'engage à :</p>
              <ul className="mt-1 space-y-1 text-gray-700 list-none">
                <li>• utiliser l'espace uniquement pour du stockage légal ;</li>
                <li>• maintenir le lieu en bon état ;</li>
                <li>• ne pas stocker de produits dangereux, inflammables, illégaux ou périssables ;</li>
                <li>• ne pas sous-louer l'espace sans accord écrit du Bailleur.</li>
              </ul>
            </div>

            <div>
              <p className="font-bold">ARTICLE 6 — RESPONSABILITÉ ET ASSURANCE</p>
              <p className="mt-1 text-gray-700">Les biens stockés restent sous la responsabilité exclusive du Locataire. Le Bailleur ne pourra être tenu responsable des vols, dégradations, incendies, dégâts des eaux ou tout autre dommage affectant les biens stockés. Le Locataire est invité à vérifier qu'il dispose d'une assurance couvrant ses biens personnels.</p>
            </div>

            <div>
              <p className="font-bold">ARTICLE 7 — ACCÈS À L'ESPACE</p>
              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                <p>Accès : <strong>{space.access_24h ? '24h/24, 7j/7' : 'Selon les horaires convenus avec le Bailleur'}</strong></p>
                <p className="text-gray-500 text-xs mt-1">Les modalités détaillées d'accès (remise des clés, code, etc.) sont convenues directement entre les parties via la messagerie Nestock.</p>
              </div>
            </div>

            <div>
              <p className="font-bold">ARTICLE 8 — RÉSILIATION</p>
              <p className="mt-1 text-gray-700">En cas de non-paiement ou de non-respect des obligations du présent contrat, le Bailleur pourra résilier la location après mise en demeure restée sans effet pendant <strong>72 heures</strong>. Le Locataire devra restituer l'espace vide et propre à la fin du contrat.</p>
            </div>

            <div>
              <p className="font-bold">ARTICLE 9 — LITIGES</p>
              <p className="mt-1 text-gray-700">Les parties privilégieront une résolution amiable en cas de litige. À défaut d'accord amiable, le litige relèvera des juridictions compétentes du domicile du Bailleur. Nestock peut proposer une médiation entre les parties.</p>
            </div>
          </div>

          <hr />

          <div className="text-sm text-gray-500 space-y-1">
            <p>Fait via la plateforme Nestock — nestock.tsukee.fr</p>
            <p>Le : {formatDate(contract?.created_at ?? new Date().toISOString())}</p>
            <p>En deux exemplaires électroniques.</p>
          </div>
        </div>

        {/* Zone de signature */}
        {contract && (
          <ContractSign
            contract={contract}
            isOwner={isOwner}
            isRenter={isRenter}
            bookingId={bookingId}
            spacePrice={Number(space.price_ttc)}
            bookingStatus={booking.status}
            profileIncomplete={profileIncomplete}
          />
        )}

      </div>
    </div>
  )
}
