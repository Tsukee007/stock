import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatWindow from '@/components/messages/ChatWindow'

export default async function MessagesPage({
  searchParams
}: {
  searchParams: Promise<{ booking_id?: string }>
}) {
  const { booking_id } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Charger toutes les conversations
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, status, created_at,
      spaces(title, city),
      profiles!bookings_renter_id_fkey(full_name)
    `)
    .or(`renter_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const activeBooking = booking_id ?? bookings?.[0]?.id

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center gap-3">
        <a href="/" className="text-gray-500 hover:text-blue-600">← Retour</a>
        <h1 className="text-xl font-bold text-blue-600">💬 Messages</h1>
      </header>

      <div className="max-w-4xl mx-auto p-4 flex gap-4 h-[calc(100vh-80px)]">

        {/* Liste des conversations */}
        <div className="w-72 bg-white rounded-xl shadow-sm overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-700">Conversations</h2>
          </div>
          {bookings?.length === 0 && (
            <p className="text-gray-400 text-sm p-4">Aucune conversation</p>
          )}
          {bookings?.map(booking => (
            <a
              key={booking.id}
              href={`/messages?booking_id=${booking.id}`}
              className={`block p-4 border-b hover:bg-blue-50 transition ${
                activeBooking === booking.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <p className="font-medium text-sm truncate">
                {(booking.spaces as any)?.title ?? 'Espace'}
              </p>
              <p className="text-gray-400 text-xs">
                {(booking.spaces as any)?.city}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                booking.status === 'active' ? 'bg-green-100 text-green-600' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-500'
              }`}>
                {booking.status}
              </span>
            </a>
          ))}
        </div>

        {/* Fenêtre de chat */}
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
          {activeBooking ? (
            <ChatWindow
              bookingId={activeBooking}
              currentUserId={user.id}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p>Sélectionne une conversation</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
