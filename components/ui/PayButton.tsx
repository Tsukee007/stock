'use client'

import { useState } from 'react'

type Props = {
  bookingId: string
}

export default function PayButton({ bookingId }: Props) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId })
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(false)
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
    >
      {loading ? '...' : '💳 Payer'}
    </button>
  )
}