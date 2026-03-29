export const statusLabels: Record<string, string> = {
  message_only: 'Message',
  pending: 'En attente',
  confirmed: 'Confirmée',
  active: 'Active',
  ended: 'Terminée',
  cancelled: 'Annulée'
}

export const statusColors: Record<string, string> = {
  message_only: 'bg-gray-100 text-gray-500',
  pending: 'bg-yellow-100 text-yellow-600',
  confirmed: 'bg-blue-100 text-blue-600',
  active: 'bg-green-100 text-green-600',
  ended: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500'
}

export function getPriceWithCommission(price: number): number {
  return Math.round(price * 1.10 * 100) / 100
}