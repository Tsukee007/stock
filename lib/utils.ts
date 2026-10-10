export const statusLabels: Record<string, string> = {
  message_only: 'Message',
  pending: 'Demande de réservation en cours',
  confirmed: 'En attente de paiement',
  active: 'Active',
  ended: 'Terminée',
  ending: 'Préavis en cours',
  awaiting_signature: 'En attente de signature locataire',
  cancelled: 'Annulée'
}

export const statusColors: Record<string, string> = {
  message_only: 'bg-gray-100 text-gray-500',
  pending: 'bg-yellow-100 text-yellow-600',
  confirmed: 'bg-blue-100 text-blue-600',
  active: 'bg-green-100 text-green-600',
  ended: 'bg-gray-100 text-gray-500',
  ending: 'bg-orange-100 text-orange-600',
  awaiting_signature: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-500'
}

export function getPriceWithCommission(price: number): number {
  return Math.round(price * 1.10 * 100) / 100
}
export function getDaysLeft(endingDate: string): number {
  const diff = new Date(endingDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// Etat d'un espace sur la carte : loue (bleu), preavis en cours (orange), a louer (vert)
export type RentalStatus = 'rented' | 'notice' | 'available'

export function getRentalStatus(bookings: { status: string | null }[] | null | undefined): RentalStatus {
  const statuses = (bookings ?? []).map(b => b.status)
  if (statuses.includes('ending')) return 'notice'
  if (statuses.some(s => s === 'active' || s === 'confirmed' || s === 'awaiting_signature')) return 'rented'
  return 'available'
}

export const rentalStatusLabels: Record<RentalStatus, string> = {
  rented: 'Loué',
  notice: 'Préavis en cours',
  available: 'À louer',
}

// Badge clair (fenetre et liste) et etiquette pleine (marqueur de la carte)
export const rentalStatusBadge: Record<RentalStatus, string> = {
  rented: 'bg-blue-100 text-blue-700',
  notice: 'bg-orange-100 text-orange-700',
  available: 'bg-green-100 text-green-700',
}

export const rentalStatusMarker: Record<RentalStatus, string> = {
  rented: 'bg-blue-600 hover:bg-blue-700',
  notice: 'bg-orange-500 hover:bg-orange-600',
  available: 'bg-green-600 hover:bg-green-700',
}
