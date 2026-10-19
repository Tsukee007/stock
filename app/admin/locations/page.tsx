import { adminClient, frDate, requireAdmin, euros } from '@/lib/admin'

export const dynamic = 'force-dynamic'

const statusLabels: Record<string, string> = {
  pending: 'Demande',
  awaiting_signature: 'Signature / paiement',
  confirmed: 'Confirmée',
  active: 'En cours',
  ending: 'Préavis',
  ended: 'Terminée',
  cancelled: 'Refusée / annulée',
}

export default async function AdminLocations() {
  await requireAdmin()
  const db = adminClient()

  const [{ data: bookings }, { data: profiles }] = await Promise.all([
    db.from('bookings')
      .select('id, status, start_date, ending_date, price_month, created_at, renter_id, spaces(title, city, owner_id)')
      .order('created_at', { ascending: false }),
    db.from('profiles').select('id, full_name'),
  ])
  const nameById = new Map((profiles ?? []).map(p => [p.id, p.full_name || 'non renseigné']))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Locations</h1>
      <p className="text-sm text-gray-500 mb-6">Ouvrez une location pour voir son dossier de preuves (contrat, paiements, messages, résiliation), à transmettre en cas de contestation de paiement.</p>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3 text-left">Espace</th>
              <th className="px-6 py-3 text-left">Propriétaire</th>
              <th className="px-6 py-3 text-left">Locataire</th>
              <th className="px-6 py-3 text-left">Statut</th>
              <th className="px-6 py-3 text-left">Début</th>
              <th className="px-6 py-3 text-left">Loyer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(bookings ?? []).map(b => {
              const space = b.spaces as any
              return (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">
                    <a href={`/admin/locations/${b.id}`} className="text-blue-600 hover:underline">{space?.title ?? 'espace supprimé'}</a>
                    <div className="text-xs text-gray-400">{space?.city}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{nameById.get(space?.owner_id) ?? ''}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{nameById.get(b.renter_id) ?? ''}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{statusLabels[b.status] ?? b.status}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{frDate(b.start_date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{euros(b.price_month)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!bookings?.length && <p className="p-6 text-sm text-gray-400">Aucune location pour l'instant.</p>}
      </div>
    </div>
  )
}
