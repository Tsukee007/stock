'use client'

import Map, { Marker, Popup } from 'react-map-gl'
import { useState, useEffect } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

type Space = {
  id: string
  title: string
  city: string
  lat: number
  lng: number
  price_month: number
  type: string
  surface_m2?: number
}

type Props = {
  spaces: Space[]
  selectedId?: string | null
  onSelect?: (id: string | null) => void
}

export default function SpacesMap({ spaces, selectedId, onSelect }: Props) {
  const [viewport, setViewport] = useState({
    longitude: 2.3522,
    latitude: 46.8566,
    zoom: 5
  })

  // Centrer sur l'espace sélectionné
  useEffect(() => {
    if (selectedId) {
      const space = spaces.find(s => s.id === selectedId)
      if (space) {
        setViewport(prev => ({
          ...prev,
          longitude: space.lng,
          latitude: space.lat,
          zoom: 13
        }))
      }
    }
  }, [selectedId])

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      longitude={viewport.longitude}
      latitude={viewport.latitude}
      zoom={viewport.zoom}
      onMove={e => setViewport(e.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {spaces.map(space => {
        const isSelected = selectedId === space.id
        return (
          <Marker
            key={space.id}
            longitude={space.lng}
            latitude={space.lat}
            onClick={() => onSelect?.(isSelected ? null : space.id)}
          >
            <div className={`
              font-bold text-xs px-2 py-1 rounded-full cursor-pointer shadow-md transition-all
              ${isSelected
                ? 'bg-blue-700 text-white scale-125 ring-2 ring-white ring-offset-1'
                : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }
            `}>
              {space.price_month}€
            </div>
          </Marker>
        )
      })}

      {selectedId && (() => {
        const space = spaces.find(s => s.id === selectedId)
        if (!space) return null
        return (
          <Popup
            longitude={space.lng}
            latitude={space.lat}
            onClose={() => onSelect?.(null)}
            closeOnClick={false}
            offset={20}
          >
            <div className="p-2 min-w-40">
              <h3 className="font-bold text-sm">{space.title}</h3>
              <p className="text-gray-500 text-xs">📍 {space.city}</p>
              {space.surface_m2 && (
                <p className="text-gray-500 text-xs">📐 {space.surface_m2} m²</p>
              )}
              <p className="text-blue-600 font-bold text-sm mt-1">{space.price_month}€/mois</p>
              <a
                href={`/spaces/${space.id}`}
                className="text-xs text-blue-500 underline block mt-1"
              >
                Voir l'annonce →
              </a>
            </div>
          </Popup>
        )
      })()}
    </Map>
  )
}
