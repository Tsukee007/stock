'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  bookingId: string
  targetId: string
  spaceId: string
  type: 'owner_to_renter' | 'renter_to_owner'
}

export default function ReviewForm({ bookingId, targetId, spaceId, type }: Props) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (rating === 0) return
    setLoading(true)
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, targetId, spaceId, rating, comment, type })
    })
    setDone(true)
    setLoading(false)
    router.refresh()
  }

  if (done) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
      <p className="text-green-600 font-semibold">✅ Avis envoyé, merci !</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-200">
      <h3 className="font-semibold text-gray-700 mb-3">⭐ Laisser un avis</h3>

      {/* Étoiles */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-3xl transition-transform hover:scale-110"
          >
            {star <= (hover || rating) ? '⭐' : '☆'}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Décrivez votre expérience..."
        rows={3}
        className="w-full border rounded-lg p-3 text-sm mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full bg-yellow-400 text-white font-semibold py-2 rounded-xl hover:bg-yellow-500 disabled:opacity-50"
      >
        {loading ? 'Envoi...' : '⭐ Publier mon avis'}
      </button>
    </div>
  )
}
