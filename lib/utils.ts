export const statusLabels: Record<string, string> = {
  message_only: 'Message',
  pending: 'En attente',
  confirmed: 'Confirmée',
  active: 'Active',
  ended: 'Terminée',
  ending: 'Préavis en cours',
  awaiting_signature: 'En attente de signature',
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
