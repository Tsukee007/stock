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
  const [view, setView] = useState<'list' | 'map'>('list')

  return (
    <div className="flex flex-col h-full md:flex-row">

      <div className="md:hidden flex border-b bg-white">
        <button
          onClick={() => setView('list')}
          className={view === 'list' ? 'flex-1 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600' : 'flex-1 py-3 text-sm font-medium text-gray-500'}
        >
          Liste ({spaces.length})
        </button>
        <button
          onClick={() => setView('map')}
          className={view === 'map' ? 'flex-1 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600' : 'flex-1 py-3 text-sm font-medium text-gray-500'}
        >
          Carte
        </button>
      </div>

      <div className={view === 'map' ? 'hidden md:flex w-full md:w-80 bg-white shadow-lg flex-col overflow-hidden' : 'flex w-full md:w-80 bg-white shadow-lg flex-col overflow-hidden'}>
        <div className="p-4 border-b bg-gray-50 hidden md:block">
          <p className="font-semibold text-gray-700">
            {spaces.length} espace{spaces.length > 1 ? 's' : ''} trouve{spaces.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {spaces.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm">Aucun resultat</p>
            </div>
          )}

          {spaces.map(space => (
            <button
              key={space.id}
              onClick={() => {
                setSelectedId(space.id === selectedId ? null : space.id)
                setView('map')
              }}
              className={selectedId === space.id ? 'w-full text-left p-4 border-b hover:bg-blue-50 bg-blue-50 border-l-4 border-l-blue-600' : 'w-full text-left p-4 border-b hover:bg-blue-50 border-l-4 border-l-transparent'}
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
                  <p className="text-gray-400 text-xs mt-0.5">📍 {space.city}</p>
                  {space.surface_m2 && (
                    <p className="text-gray-400 text-xs">📐 {space.surface_m2} m²</p>
                  )}
                </div>
                <div className="text-right ml-2">
                  <p className="font-bold text-blue-600">{Math.round(space.price_month * 1.10)}€</p>
                  <p className="text-gray-400 text-xs">/mois TTC</p>
                </div>
              </div>

{selectedId === space.id && (
  
    href={'/spaces/' + space['id']}
                  onClick={e => e.stopPropagation()}
                  className="mt-2 inline-block text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                >
                  Voir l'annonce
                </a>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={view === 'list' ? 'hidden md:flex flex-1' : 'flex flex-1'}>
        <SpacesMap
          spaces={spaces}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
        />
      </div>

    </div>
  )
}