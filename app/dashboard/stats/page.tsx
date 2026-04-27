import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StatsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer toutes les annonces du propriétaire
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, title, city, price_month')
    .eq('owner_id', user.id)

  const spaceIds = spaces?.map(s => s.id) ?? []

  // Récupérer tout l'historique des locations
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, spaces(title, city, price_month), profiles!bookings_renter_id_fkey(full_name, avatar_url)')
    .in('space_id', spaceIds.length > 0 ? spaceIds : ['none'])
    .order('created_at', { ascending: false })

  // Calcul des stats
  const endedBookings = bookings?.filter(b => b.status === 'ended') ?? []
  const activeBookings = bookings?.filter(b => b.status === 'active') ?? []
  const totalRevenue = endedBookings.reduce((sum, b) => sum + (b.price_month * 0.95), 0)
  const monthlyRevenue = activeBookings.reduce((sum, b) => sum + (b.price_month * 0.95), 0)

  // Stats par annonce
  const statsBySpace = spaces?.map(space => {
    const spaceBookings = bookings?.filter(b => b.space_id === space.id) ?? []
    const spaceEnded = spaceBookings.filter(b => b.status === 'ended')
    const spaceActive = spaceBookings.filter(b => b.status === 'active')
    const spaceRevenue = spaceEnded.reduce((sum, b) => sum + (b.price_month * 0.95), 0)
    const spaceMonthly = spaceActive.reduce((sum, b) => sum + (b.price_month * 0.95), 0)

    return {
      ...space,
      totalBookings: spaceBookings.length,
      activeBookings: spaceActive.length,
      totalRevenue: spaceRevenue,
      monthlyRevenue: spaceMonthly,
    }
  }) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-500 hover:text-blue-600">← Dashboard</a>
          <h1 className="text-2xl font-bold">📊 Mes statistiques</h1>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{spaces?.length ?? 0}</p>
            <p className="text-gray-500 text-sm mt-1">Annonces</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{activeBookings.length}</p>
            <p className="text-gray-500 text-sm mt-1">Locations actives</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{monthlyRevenue.toFixed(0)}€</p>
            <p className="text-gray-500 text-sm mt-1">Revenus/mois</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{totalRevenue.toFixed(0)}€</p>
            <p className="text-gray-500 text-sm mt-1">Revenus totaux</p>
          </div>
        </div>

        {/* Stats par annonce */}
        <div>
          <h2 className="text-lg font-bold mb-4">📍 Performance par annonce</h2>
          <div className="space-y-3">
            {statsBySpace.map(space => (
              <div key={space.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{space.title}</h3>
                    <p className="text-gray-500 text-sm">📍 {space.city} · {space.price_month}€/mois</p>
                  </div>
                  <a href={`/spaces/${space.id}`} className="text-sm text-blue-600 hover:underline">
                    Voir →
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="font-bold text-blue-600">{space.totalBookings}</p>
                    <p className="text-gray-500 text-xs">Locations</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="font-bold text-green-600">{space.monthlyRevenue.toFixed(0)}€</p>
                    <p className="text-gray-500 text-xs">Ce mois</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="font-bold text-purple-600">{space.totalRevenue.toFixed(0)}€</p>
                    <p className="text-gray-500 text-xs">Total généré</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historique des locations */}
        <div>
          <h2 className="text-lg font-bold mb-4">📋 Historique des locations</h2>
          {bookings?.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>Aucune location pour le moment</p>
            </div>
          )}
          <div className="space-y-3">
            {bookings?.map(booking => {
              const space = booking.spaces as any
              const renter = booking.profiles as any
              const revenue = booking.price_month * 0.95

              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {renter?.full_name?.[0] ?? '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{renter?.full_name ?? 'Anonyme'}</p>
                        <p className="text-gray-500 text-sm">{space?.title}</p>
                        <p className="text-gray-400 text-xs">
                          Depuis le {new Date(booking.start_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        booking.status === 'active' ? 'bg-green-100 text-green-600' :
                        booking.status === 'ended' ? 'bg-gray-100 text-gray-500' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {booking.status === 'active' ? 'Active' :
                         booking.status === 'ended' ? 'Terminée' :
                         booking.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                      </span>
                      <p className="font-bold text-green-600 mt-1">{revenue.toFixed(0)}€</p>
                      <p className="text-gray-400 text-xs">/mois net</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}