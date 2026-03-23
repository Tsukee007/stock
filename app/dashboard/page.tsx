import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingAction from '@/components/ui/BookingAction'
import ReviewForm from '@/components/ui/ReviewForm'

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
    .select('*, spaces(id, title, city, price_month, owner_id), reviews(id, author_id)')
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

  const manageableBookings = spaces?.flatMap(space =>
    ((space.bookings as any[]) ?? [])
      .filter(b => b.status === 'confirmed' || b.status === 'active')
      .map(b => ({ ...b, spaceTitle: space.title }))
  ) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        {/* Header */}
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

        {/* Locations en cours */}
        {manageableBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-4">🔑 Locations en cours</h2>
            <div className="space-y-3">
              {manageableBookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-400">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-
