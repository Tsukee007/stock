import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function BookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, spaces(title, address, city, surface_m2, type, price_month, owner_id), profiles!bookings_renter_id_fkey(full_name)')
    .eq('id', id)
    .single()

  if (!booking) notFound()

  const space = booking.spaces as any
  const renter = booking.profiles as any

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', space.owner_id)
    .single()

  const { data: contract } = await supabase
    .from('contracts')
    .select('id, status, reference, created_at')
    .eq('booking_id', id)
    .single()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, reference, amount, created_at, status')
    .eq('booking_id', id)
    .order('created_at', { ascending: false })

  const isOwner = user.id === space.owner_id
  const isRenter = user.id === booking.renter_id

  if (!isOwner && !isRenter) redirect('/dashboard')

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    awaiting_signature: 'En attente de signature',
    confirmed: 'Confirmee',
    active: 'Active',
    ended: 'Terminee',
    cancelled: 'Annulee'
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    awaiting_signature: 'bg-orange-100 text-orange-700',
    confirmed: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    ended: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-500 hover:text-blue-600">← Dashboard</a>
          <h1 className="text-xl font-bold">📦 Détail de la location</h1>
        </div>

        {/* Statut */}
        <div className={`rounded-xl p-4 text-center font-semibold ${statusColors[booking.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {statusLabels[booking.status] ?? booking.status}
        </div>

        {/* Infos espace */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-lg">🗄️ Espace de stockage</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Titre</p>
              <p className="font-semibold">{space.title}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Type</p>
              <p className="font-semibold capitalize">{space.type}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Adresse</p>
              <p className="font-semibold">{space.address}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Ville</p>
              <p className="font-semibold">{space.city}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Surface</p>
              <p className="font-semibold">{space.surface_m2} m²</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Prix mensuel</p>
              <p className="font-semibold text-blue-600">{space.price_month}€/mois</p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-lg">👥 Parties</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Propriétaire</p>
              <p className="font-semibold">{ownerProfile?.full_name ?? 'Anonyme'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Locataire</p>
              <p className="font-semibold">{renter?.full_name ?? 'Anonyme'}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-lg">📅 Dates</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Début</p>
              <p className="font-semibold">{new Date(booking.start_date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Fin</p>
              <p className="font-semibold">{booking.end_date ? new Date(booking.end_date).toLocaleDateString('fr-FR') : 'Reconduction tacite'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="font-bold text-lg">🔗 Actions</h2>
          <a href={'/messages?booking_id=' + id}
            className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
            <span className="text-xl">💬</span>
            <div>
              <p className="font-semibold text-blue-700">Messages</p>
              <p className="text-xs text-gray-500">Voir la conversation</p>
            </div>
          </a>
          {contract && (
            <a href={'/contracts/' + id}
              className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
              <span className="text-xl">📄</span>
              <div>
                <p className="font-semibold text-purple-700">Contrat</p>
                <p className="text-xs text-gray-500">
                  {contract.reference && 'Réf. ' + contract.reference + ' — '}
                  {contract.status === 'fully_signed' ? '✅ Signé' : '⏳ En attente'}
                </p>
              </div>
            </a>
          )}
        </div>

        {/* Factures */}
        {invoices && invoices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <h2 className="font-bold text-lg">🧾 Factures</h2>
            {invoices.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-sm">{invoice.reference}</p>
                  <p className="text-xs text-gray-500">{new Date(invoice.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{invoice.amount.toFixed(2)}€</p>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Payée</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
