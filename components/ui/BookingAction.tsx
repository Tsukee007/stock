'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  bookingId: string
  status: string
  label: string
  color: 'green' | 'red' | 'blue' | 'gray'
}

const colors = {
  green: 'bg-green-100 text-green-700 hover:bg-green-200',
  red: 'bg-red-100 text-red-700 hover:bg-red-200',
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
}

export default function BookingAction({ bookingId, status, label, color }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${colors[color]} disabled:opacity-50`}
    >
      {loading ? '...' : label}
    </button>
  )
}
