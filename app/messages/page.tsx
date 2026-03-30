import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatWindow from '@/components/messages/ChatWindow'
import { statusLabels } from '@/lib/utils'

export default async function MessagesPage({
  searchParams
}: {
  searchParams: Promise<{ booking_id?: string }>
}) {
  const { booking_id } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ownedSpaces } = await supabase
    .from('spaces')
    .select('id')
    .eq('owner_id', user.id)

  const ownedSpaceIds = ownedSpaces?.map(s => s.id) ?? []

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`id, status, created_at, renter_id, spaces(id, title, city, owner_id), profiles!bookings_renter_id_fkey(full_name)`)
    .order('created_at', { ascending: false })

  const filteredBookings = bookings?.filter(b => {
    const space = b.spaces as any
    return b.renter_id === user.id || ownedSpaceIds.includes(space?.id)
  }) ?? []

  const activeBookingId = booking_id ?? filteredBookings?.[0]?.id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 flex gap-4" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="w-72 bg-white rounded-xl shadow-sm overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-700">Conversations</h2>
          </div>
          {filteredBookings.length === 0 && (
            <p className="text-gray-400 text-sm p-4">Aucune conversation</p>
          )}
          {filteredBookings.map(booking => {
            const space = booking.spaces as any
            const renter = booking.profiles as any
            return (
              <a
                key={booking.id}
                href={`/messages?booking_id=${booking.id}`}
                className={`block p-4 border-b hover:bg-blue-50 transition ${activeBookingId === booking.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
              >
                <p className="font-medium text-sm truncate">{space?.title ?? 'Espace'}</p>
                <p className="text-gray-400 text-xs">{space?.city}</p>
                <p className="text-gray-400 text-xs">{renter?.full_name ?? 'Locataire'}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                  booking.status === 'active' ? 'bg-green-100 text-green-600' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {statusLabels[booking.status] ?? booking.status}
                </span>
              </a>
            )
          })}
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
          {activeBookingId ? (
            <ChatWindow bookingId={activeBookingId} currentUserId={user.id} />
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