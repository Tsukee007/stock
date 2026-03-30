'use client'

import { useState } from 'react'

type Props = {
  review: {
    id: string
    rating: number
    comment: string | null
    created_at: string
    profiles: {
      full_name: string | null
      avatar_url: string | null
    } | null
  }
}

export default function ReviewCard({ review }: Props) {
  const [expanded, setExpanded] = useState(false)
  const author = review.profiles
  const isLong = (review.comment?.length ?? 0) > 120

  return (
    <div
      onClick={() => isLong && setExpanded(!expanded)}
      className={`
        border rounded-xl p-4 transition-all duration-300
        ${isLong ? 'cursor-pointer hover:shadow-md hover:border-blue-200' : ''}
        ${expanded ? 'shadow-md border-blue-200 bg-blue-50' : 'bg-white'}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
          {author?.full_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{author?.full_name ?? 'Anonyme'}</p>
          <p className="text-gray-600 text-xs">
            {new Date(review.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        {/* Étoiles */}
        <div className="flex gap-0.5 flex-shrink-0">
          {[1,2,3,4,5].map(star => (
            <span key={star} className="text-sm">
              {star <= review.rating ? '⭐' : '☆'}
            </span>
          ))}
        </div>
      </div>

      {/* Commentaire */}
      {review.comment && (
        <div className="relative">
          <p className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ${
            !expanded && isLong ? 'line-clamp-2' : ''
          }`}>
            {review.comment}
          </p>
          {isLong && !expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
          )}
          {isLong && (
            <p className="text-blue-500 text-xs mt-1 font-medium">
              {expanded ? 'Voir moins ↑' : 'Voir plus ↓'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}