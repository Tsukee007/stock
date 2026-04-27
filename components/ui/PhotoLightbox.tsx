'use client'

import { useState } from 'react'

type Props = {
  photos: { url: string }[]
}

export default function PhotoLightbox({ photos }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  if (!photos.length) return null

  return (
    <>
      {/* Grille de photos */}
      <div className="flex gap-3 overflow-x-auto">
        {photos
          .sort((a: any, b: any) => a.position - b.position)
          .map((photo, i) => (
            <img
              key={i}
              src={photo.url}
              alt={`Photo ${i + 1}`}
              onClick={() => setSelected(photo.url)}
              className="w-48 h-36 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-transform"
            />
          ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:opacity-70"
          >
            ×
          </button>
          <img
            src={selected}
            alt="Photo agrandie"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}