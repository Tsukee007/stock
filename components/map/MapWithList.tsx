'use client'

import { useState } from 'react'
import SpacesMap from './SpacesMap'

type Space = {
  id: string
  title: string
  city: string
  lat: number
  lng: number
  price_month: number
  type: string
  surface_m2?: number
  address?: string
}

const typeEmoji: Record<string, string> = {
  garage: '🚗',
  cave: '🍷',
  grenier: '🏠',
  box: '📦',
  autre: '📋'
}

export default function MapWithList({ spaces }: { spaces: Space[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="flex h-full">
      {/* Liste à gauche */}
      <div className="w-80 bg-white shadow-lg z-10 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <p className="font-semibold text-gray-700">
            {spaces.length} espace{spaces.length > 1 ? 's' : ''} trouvé{spaces.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {spaces.length === 0 && (
            <div className="p-8 text-center text-gray-600">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm">Aucun résultat</p>
              <p className="text-xs mt-1">Essayez d'élargir votre recherche</p>
            </div>
          )}

          {spaces.map(space => (
            <button
              key={space.id}
              onClick={() => setSelectedId(space.id === selectedId ? null : space.id)}
              className={`w-full text-left p-4 border-b hover:bg-blue-50 transition ${
                selectedId === space.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-600'
                  : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm">{typeEmoji[space.type] ?? '📦'}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                      {space.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 leading-tight">
                    {space.title}
                  </h3>
                  <p className="text-gray-600 text-xs mt-0.5">
                    📍 {space.city}
                  </p>
                  {space.surface_m2 && (
                    <p className="text-gray-600 text-xs">
                      📐 {space.surface_m2} m²
                    </p>
                  )}
                </div>
                <div className="text-right ml-2">
<p className="font-bold text-blue-600">{Math.round(space.price_month * 1.10)}€</p>
<p className="text-gray-600 text-xs">/mois TTC</p>
                </div>
              </div>

              {selectedId === space.id && (
                <a
                  href={`/spaces/${space.id}`}
                  onClick={e => e.stopPropagation()}
                  className="mt-2 inline-block text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                >
                  Voir l'annonce →
                </a>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Carte à droite */}
      <div className="flex-1">
        <SpacesMap
          spaces={spaces}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  )
}
