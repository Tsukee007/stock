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

  const { data: ownedSpaces } = await supabase.from('spaces').select('id').eq('owner_id', user.id)
  const ownedSpaceIds = ownedSpaces?.map(s => s.id) ?? []

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, status, created_at, renter_id, spaces(id, title, city, owner_id), profiles!bookings_renter_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  const filteredBookings = bookings?.filter(b => {
    const space = b.spaces as any
    return b.renter_id === user.id || ownedSpaceIds.includes(space?.id)
  }) ?? []

  const activeBookingId = booking_id ?? filteredBookings?.[0]?.id
  const showChat = !!booking_id

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-600'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-600'
    if (status === 'confirmed') return 'bg-blue-100 text-blue-600'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto flex h-[calc(100vh-120px)] md:h-[calc(100vh-80px)]">
        <div className={showChat ? 'hidden md:flex w-full md:w-72 bg-white shadow-sm flex-col overflow-hidden' : 'flex w-full md:w-72 bg-white shadow-sm flex-col overflow-hidden'}>
          <div className="p-4 border-b">
            <h2 className="font-bold text-black">Conversations</h2>
          </div>
          {filteredBookings.length === 0 && (
            <p className="text-gray-400 text-sm p-4">Aucune conversation</p>
          )}
          {filteredBookings.map(booking => {
            const space = booking.spaces as any
            const renter = booking.profiles as any
            const bid = booking['id']
            const isActive = activeBookingId === bid
            return (
              
                key={bid}
                href={'/messages?booking_id=' + bid}
                className={'block p-4 border-b hover:bg-blue-50 transition ' + (isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'bg-white')}
              >
                <p className="font-bold text-sm truncate text-black">{space?.title ?? 'Espace'}</p>
                <p className="text-gray-700 text-xs">{space?.city}</p>
                <p className="text-gray-700 text-xs">{renter?.full_name ?? 'Locataire'}</p>
                <span className={'text-xs px-2 py-0.5 rounded-full mt-1 inline-block ' + getStatusColor(booking['status'])}>
                  {statusLabels[booking['status']] ?? booking['status']}
                </span>
              </a>
            )
          })}
        </div>
        <div className={showChat ? 'flex flex-1 bg-white flex-col overflow-hidden' : 'hidden md:flex flex-1 bg-white flex-col overflow-hidden'}>
          {showChat && (
            <div className="md:hidden p-3 border-b">
              <a href="/messages" className="text-gray-500 text-sm">Retour</a>
            </div>
          )}
          {activeBookingId ? (
            <ChatWindow bookingId={activeBookingId} currentUserId={user.id} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p>Selectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
