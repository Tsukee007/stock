import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingAction from '@/components/ui/BookingAction'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: spaces } = await supabase
    .from('spaces')
    .select('*, bookings(id, status, renter_id, created_at)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, spaces(title, city, price_month)')
    .eq('renter_id', user.id)
    .order('created_at', { ascending: false })

  const totalRevenue = spaces?.reduce((acc, space) => {
    const activeBookings = (space.bookings as any[])?.filter(b => b.status === 'active').length ?? 0
    return acc + (activeBookings * space.price_month * 0.95)
  }, 0) ?? 0

  const pendingBookings = spaces?.flatMap(space =>
    ((space.bookings as any[]) ?? [])
      .filter(b => b.status === 'pending')
      .map(b => ({ ...b, spaceTitle: space.title, spaceId: space.id }))
  ) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Mon tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{spaces?.length ?? 0}</p>
            <p className="text-gray-500 text-sm mt-1">Annonces</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{bookings?.length ?? 0}</p>
            <p className="text-gray-500 text-sm mt-1">Locations</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{totalRevenue.toFixed(0)}€</p>
            <p className="text-gray-500 text-sm mt-1">Revenus/mois</p>
          </div>
        </div>

        {/* Demandes reçues */}
        {pendingBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              🔔 Demandes reçues
              <span className="ml-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingBookings.length}
              </span>
            </h2>
            <div className="space-y-3">
              {pendingBookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-400">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{booking.spaceTitle}</h3>
                      <p className="text-gray-400 text-xs mt-1">
                        Demande reçue le {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <BookingAction bookingId={booking.id} status="confirmed" label="✅ Accepter" color="green" />
                      <BookingAction bookingId={booking.id} status="cancelled" label="❌ Refuser" color="red" />
                    </div>
                  </div>
                  <a href={`/messages?booking_id=${booking.id}`}
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                    💬 Voir la conversation
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Réservations à gérer */}
{(() => {
  const manageable = spaces?.flatMap(space =>
    ((space.bookings as any[]) ?? [])
      .filter(b => b.status === 'confirmed' || b.status === 'active')
      .map(b => ({ ...b, spaceTitle: space.title }))
  ) ?? []

  if (manageable.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        🔑 Locations en cours
      </h2>
      <div className="space-y-3">
        {manageable.map(booking => (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-400">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{booking.spaceTitle}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  booking.status === 'active'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {booking.status === 'active' ? '🟢 Active' : '🔵 Confirmée'}
                </span>
              </div>
              <div className="flex gap-2">
                {booking.status === 'confirmed' && (
                  <BookingAction
                    bookingId={booking.id}
                    status="active"
                    label="🟢 Marquer actif"
                    color="blue"
                  />
                )}
                {booking.status === 'active' && (
                  <BookingAction
                    bookingId={booking.id}
                    status="ended"
                    label="👋 Terminer"
                    color="gray"
                  />
                )}
              </div>
            </div>
            <a href={`/messages?booking_id=${booking.id}`}
              className="text-xs text-blue-600 hover:underline mt-2 inline-block">
              💬 Voir la conversation
            </a>
          </div>
        ))}
      </div>
    </div>
  )
})()}


        {/* Mes annonces */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">🗄️ Mes annonces</h2>
            <a href="/spaces/new"
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
              + Nouvelle annonce
            </a>
          </div>

          {spaces?.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              <p className="text-4xl mb-3">🗄️</p>
              <p>Aucune annonce pour le moment</p>
              <a href="/spaces/new" className="text-blue-600 text-sm mt-2 inline-block">
                Déposer ma première annonce →
              </a>
            </div>
          )}

          <div className="space-y-3">
            {spaces?.map(space => {
              const activeBookings = (space.bookings as any[])?.filter(b => b.status === 'active').length ?? 0
              const pendingCount = (space.bookings as any[])?.filter(b => b.status === 'pending').length ?? 0

              return (
                <div key={space.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{space.title}</h3>
                      <p className="text-gray-400 text-sm">📍 {space.city} · {space.surface_m2}m² · {space.price_month}€/mois</p>
                      <div className="flex gap-2 mt-2">
                        {activeBookings > 0 && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                            {activeBookings} actif
                          </span>
                        )}
                        {pendingCount > 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                            {pendingCount} en attente
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          space.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {space.is_active ? 'Visible' : 'Masquée'}
                        </span>
                      </div>
                    </div>
                    <a href={`/spaces/${space.id}`} className="text-sm text-blue-600 hover:underline">
                      Voir →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mes locations */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4">🔑 Mes locations</h2>

          {bookings?.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              <p className="text-4xl mb-3">🔑</p>
              <p>Aucune location en cours</p>
              <a href="/" className="text-blue-600 text-sm mt-2 inline-block">
                Trouver un espace →
              </a>
            </div>
          )}

          <div className="space-y-3">
            {bookings?.map(booking => {
              const space = booking.spaces as any
              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{space?.title}</h3>
                      <p className="text-gray-400 text-sm">📍 {space?.city} · {space?.price_month}€/mois</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Depuis le {new Date(booking.start_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        booking.status === 'active' ? 'bg-green-100 text-green-600' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {booking.status}
                      </span>
                      <a href={`/messages?booking_id=${booking.id}`}
                        className="text-xs text-blue-600 hover:underline">
                        💬 Messages
                      </a>
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
