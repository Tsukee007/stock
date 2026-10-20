'use client'

import Map, { Marker, Popup, NavigationControl, Source, Layer, type MapRef, type MapLayerMouseEvent } from 'react-map-gl'
import type { GeoJSONSource } from 'mapbox-gl'
import { type RentalStatus, rentalStatusBadge, rentalStatusLabels, rentalStatusMarker } from '@/lib/utils'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

type Space = {
  id: string
  title: string
  city: string
  lat: number
  lng: number
  price_month: number
  price_ttc?: number
  type: string
  rental_status?: RentalStatus
  surface_m2?: number
}

type Props = {
  spaces: Space[]
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  // Page d'accueil : la molette seule fait défiler la page, Ctrl/⌘ + molette zoome
  cooperativeGestures?: boolean
}

const mapLocale = {
  'ScrollZoomBlocker.CtrlMessage': 'Maintenez Ctrl + molette pour zoomer sur la carte',
  'ScrollZoomBlocker.CmdMessage': 'Maintenez ⌘ + molette pour zoomer sur la carte',
  'TouchPanBlocker.Message': 'Utilisez deux doigts pour déplacer la carte',
  'NavigationControl.ZoomIn': 'Zoomer',
  'NavigationControl.ZoomOut': 'Dézoomer',
  'NavigationControl.ResetBearing': 'Réorienter vers le nord',
}

// Au-delà de ce zoom, chaque annonce est affichée seule (le zoom 13 de la sélection les montre donc toutes)
const CLUSTER_MAX_ZOOM = 12

export default function SpacesMap({ spaces, selectedId, onSelect, cooperativeGestures = false }: Props) {
  const [viewport, setViewport] = useState({
    longitude: 2.3522,
    latitude: 46.8566,
    zoom: 5
  })

  const mapRef = useRef<MapRef>(null)
  // Annonces affichées seules (hors bulle) ; null tant que la carte n'a pas calculé les bulles
  const [unclusteredIds, setUnclusteredIds] = useState<Set<string> | null>(null)
  const [cursor, setCursor] = useState('')

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: spaces.map(space => ({
      type: 'Feature' as const,
      properties: { id: space.id },
      geometry: { type: 'Point' as const, coordinates: [space.lng, space.lat] }
    }))
  }), [spaces])

  // Les bulles sont dessinées par Mapbox ; les annonces seules gardent leur étiquette de prix
  const refreshUnclustered = useCallback(() => {
    const map = mapRef.current
    if (!map || !map.getSource('spaces')) return
    const features = map.querySourceFeatures('spaces', { filter: ['!', ['has', 'point_count']] })
    setUnclusteredIds(new Set(features.map(f => String(f.properties?.id))))
  }, [])

  const handleClick = (e: MapLayerMouseEvent) => {
    const cluster = e.features?.[0]
    const map = mapRef.current
    if (!cluster || !map || cluster.geometry.type !== 'Point') return
    const [longitude, latitude] = cluster.geometry.coordinates
    const source = map.getSource('spaces') as GeoJSONSource
    source.getClusterExpansionZoom(cluster.properties?.cluster_id, (err, zoom) => {
      if (err || zoom == null) return
      setViewport(prev => ({ ...prev, longitude, latitude, zoom }))
    })
  }

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
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      longitude={viewport.longitude}
      latitude={viewport.latitude}
      zoom={viewport.zoom}
      onMove={e => setViewport(e.viewState)}
      onMoveEnd={refreshUnclustered}
      onSourceData={e => { if (e.sourceId === 'spaces' && e.isSourceLoaded) refreshUnclustered() }}
      interactiveLayerIds={['clusters']}
      onClick={handleClick}
      onMouseEnter={() => setCursor('pointer')}
      onMouseLeave={() => setCursor('')}
      cursor={cursor}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      cooperativeGestures={cooperativeGestures}
      locale={mapLocale}
    >
      {cooperativeGestures && <NavigationControl position="top-right" showCompass={false} />}
      <Source id="spaces" type="geojson" data={geojson} cluster clusterMaxZoom={CLUSTER_MAX_ZOOM} clusterRadius={50}>
        <Layer
          id="clusters"
          type="circle"
          filter={['has', 'point_count']}
          paint={{
            'circle-color': '#374151',
            'circle-opacity': 0.85,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 50, 26, 200, 32]
          }}
        />
        <Layer
          id="cluster-count"
          type="symbol"
          filter={['has', 'point_count']}
          layout={{
            'text-field': ['get', 'point_count_abbreviated'],
            'text-size': 12,
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold']
          }}
          paint={{ 'text-color': '#ffffff' }}
        />
      </Source>

      {spaces.map(space => {
        const isSelected = selectedId === space.id
        if (!isSelected && !unclusteredIds?.has(space.id)) return null
        return (
          <Marker
            key={space.id}
            longitude={space.lng}
            latitude={space.lat}
            onClick={() => onSelect?.(isSelected ? null : space.id)}
          >
            <div title={rentalStatusLabels[space.rental_status ?? 'available']} className={`
              font-bold text-xs px-2 py-1 rounded-full cursor-pointer shadow-md transition-all
              text-white ${rentalStatusMarker[space.rental_status ?? 'available']}
              ${isSelected ? 'scale-125 ring-2 ring-white ring-offset-1' : 'border border-white'}
            `}>
              {(space.price_ttc ?? Math.round(space.price_month * 1.10)).toFixed(2)}€
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
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rentalStatusBadge[space.rental_status ?? 'available']}`}>
                {rentalStatusLabels[space.rental_status ?? 'available']}
              </span>
              <p className="text-gray-500 text-xs">📍 {space.city}</p>
              {space.surface_m2 && (
                <p className="text-gray-500 text-xs">📐 {space.surface_m2} m²</p>
              )}
              <p className="text-blue-600 font-bold text-sm mt-1">{(space.price_ttc ?? Math.round(space.price_month * 1.10)).toFixed(2)}€/mois</p>
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
