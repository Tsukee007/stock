import { adminClient, frDate, requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AdminInscrits() {
  await requireAdmin()
  const db = adminClient()

  const [{ data: usersData }, profiles, spaces, bookings] = await Promise.all([
    db.auth.admin.listUsers({ perPage: 1000 }),
    db.from('profiles').select('id, full_name, city'),
    db.from('spaces').select('owner_id'),
    db.from('bookings').select('renter_id'),
  ])

  const profileById = new Map((profiles.data ?? []).map(p => [p.id, p]))
  const count = (ids: (string | null)[] | undefined, id: string) => (ids ?? []).filter(x => x === id).length
  const ownerIds = spaces.data?.map(s => s.owner_id)
  const renterIds = bookings.data?.map(b => b.renter_id)

  const users = (usersData?.users ?? [])
    .map(u => ({
      id: u.id,
      email: u.email ?? '',
      full_name: profileById.get(u.id)?.full_name || '',
      city: profileById.get(u.id)?.city || '',
      created_at: u.created_at,
      confirmed: !!u.email_confirmed_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      admin: u.app_metadata?.role === 'admin',
      spaces: count(ownerIds, u.id),
      bookings: count(renterIds, u.id),
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const total = users.length
  const confirmes = users.filter(u => u.confirmed).length
  const depuis30j = users.filter(u => Date.now() - new Date(u.created_at).getTime() < 30 * 86400000).length

  const stats = [
    { label: 'Comptes inscrits', value: total, sub: `dont ${depuis30j} ces 30 derniers jours` },
    { label: 'Adresse e-mail confirmee', value: confirmes, sub: `${total - confirmes} en attente` },
    { label: 'Ont publie un espace', value: users.filter(u => u.spaces > 0).length, sub: 'proprietaires' },
    { label: 'Ont fait une demande', value: users.filter(u => u.bookings > 0).length, sub: 'locataires' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inscrits</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-1">{s.value}</div>
            <div className="text-sm text-gray-700">{s.label}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Liste des inscrits</h2>
          <span className="text-sm text-gray-500">cliquez sur un nom pour ouvrir sa fiche</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Ville</th>
                <th className="px-6 py-3 text-left">Inscrit le</th>
                <th className="px-6 py-3 text-left">Email confirme</th>
                <th className="px-6 py-3 text-left">Derniere connexion</th>
                <th className="px-6 py-3 text-left">Annonces</th>
                <th className="px-6 py-3 text-left">Demandes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">
                    <a href={`/admin/inscrits/${u.id}`} className="text-blue-600 hover:underline">
                      {u.full_name || 'non renseigne'}
                    </a>
                    {u.admin && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">admin</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.city}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{frDate(u.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${u.confirmed ? 'text-green-600' : 'text-orange-500'}`}>
                      {u.confirmed ? 'Oui' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{frDate(u.last_sign_in_at) || 'jamais'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.spaces}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
