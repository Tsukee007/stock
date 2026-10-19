import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isOwnerStripeReady } from '@/lib/ownerStripe'
import { createRentCheckout } from '@/lib/rentCheckout'

// Bouton « Payer » : le locataire a signé mais n'a pas terminé le paiement (page Stripe quittée).
// On recrée la même page de paiement qu'à la signature.
export async function POST(req: Request) {
  const { bookingId } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, renter_id, spaces(title, price_month, price_ttc, owner_id)')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  if (booking.renter_id !== user.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { data: contract } = await supabase
    .from('contracts')
    .select('id, status, loyer_ttc')
    .eq('booking_id', bookingId)
    .single()

  if (booking.status !== 'awaiting_signature' || contract?.status !== 'fully_signed') {
    return NextResponse.json({ error: 'Cette location n\'est pas en attente de paiement.' }, { status: 400 })
  }

  const space = booking.spaces as any
  if (!(await isOwnerStripeReady(space.owner_id))) {
    return NextResponse.json({ error: 'Le propriétaire doit encore finaliser son compte de paiement. Nous l\'avons prévenu.' }, { status: 409 })
  }

  const url = await createRentCheckout({
    bookingId,
    contractId: contract.id,
    title: space.title,
    priceTtc: contract.loyer_ttc ?? space.price_ttc,
    priceMonth: space.price_month
  })

  return NextResponse.json({ url })
}
