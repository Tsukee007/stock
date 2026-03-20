'use client'

import Map, { Marker, Popup } from 'react-map-gl'
import { useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

type Space = {
  id: string
  title: string
  city: string
  lat: number
  lng: number
  price_month: number
  type: string
}

export default function SpacesMap({ spaces }: { spaces: Space[] }) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: 2.3522, latitude: 48.8566, zoom: 5 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {spaces.map(space => (
        <Marker
          key={space.id}
          longitude={space.lng}
          latitude={space.lat}
          onClick={() => setSelectedSpace(space)}
        >
          <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full cursor-pointer hover:bg-blue-700 shadow-md">
            {space.price_month}€
          </div>
        </Marker>
      ))}

      {selectedSpace && (
        <Popup
          longitude={selectedSpace.lng}
          latitude={selectedSpace.lat}
          onClose={() => setSelectedSpace(null)}
          closeOnClick={false}
        >
          <div className="p-2">
            <h3 className="font-bold text-sm">{selectedSpace.title}</h3>
            <p className="text-gray-500 text-xs">{selectedSpace.city}</p>
            <p className="text-blue-600 font-bold text-sm mt-1">{selectedSpace.price_month}€/mois</p>
            <a href={`/spaces/${selectedSpace.id}`} className="text-xs text-blue-500 underline">
              Voir l'annonce →
            </a>
          </div>
        </Popup>
      )}
    </Map>
  )
}

