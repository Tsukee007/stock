'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  initialFilters: {
    city?: string
    type?: string
    minPrice?: string
    maxPrice?: string
    minSurface?: string
    radius?: string
    lat?: string
    lng?: string
  }
}

const RADIUS_OPTIONS = [2,5, 10, 20, 30, 50, 100]

export default function SearchFilters({ initialFilters }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState(initialFilters)
  const [cityQuery, setCityQuery] = useState(initialFilters.city ?? '')
  const [citySuggestions, setCitySuggestions] = useState<Array<{name: string, lat: number, lng: number}>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchCities = async (value: string) => {
    if (value.length < 2) {
      setCitySuggestions([])
      return
    }

    // Geocoding Mapbox pour chercher les villes
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=fr&language=fr&types=place&limit=5`
    )
    const data = await res.json()
    const cities = data.features?.map((f: any) => ({
      name: f.text,
      lat: f.center[1],
      lng: f.center[0]
    })) ?? []
    setCitySuggestions(cities)
    setShowSuggestions(true)
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCityQuery(value)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => searchCities(value), 300)
  }

  const handleCitySelect = (city: { name: string, lat: number, lng: number }) => {
    setCityQuery(city.name)
    setFilters(prev => ({
      ...prev,
      city: city.name,
      lat: city.lat.toString(),
      lng: city.lng.toString()
    }))
    setShowSuggestions(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value as string)
    })
    router.push(`/?${params.toString()}`)
    setOpen(false)
  }

  const handleReset = () => {
    setFilters({})
    setCityQuery('')
    router.push('/')
    setOpen(false)
  }

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl px-4">
      {/* Barre de recherche */}
      <div className="bg-white rounded-2xl shadow-lg p-3 flex items-center gap-3">
        <div className="relative flex-1">
          <input
            value={cityQuery}
            onChange={handleCityChange}
            onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="🔍 Rechercher une ville..."
            className="w-full outline-none text-sm"
          />
          {/* Suggestions villes */}
          {showSuggestions && citySuggestions.length > 0 && (
            <div className="absolute top-8 left-0 right-0 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
              {citySuggestions.map((city, i) => (
                <button
                  key={i}
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b last:border-0"
                >
                  📍 {city.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl transition ${
            activeCount > 0
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ⚙️ Filtres
          {activeCount > 0 && (
            <span className="bg-white text-blue-600 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-xl hover:bg-blue-700"
        >
          OK
        </button>
      </div>

      {/* Panneau de filtres */}
      {open && (
        <div className="bg-white rounded-2xl shadow-lg p-4 mt-2 space-y-4">

          {/* Rayon de recherche */}
          {filters.lat && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                📏 Rayon autour de {cityQuery}
              </label>
              <div className="flex gap-2 flex-wrap">
                {RADIUS_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setFilters(prev => ({ ...prev, radius: r.toString() }))}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      filters.radius === r.toString()
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-600 border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type d'espace</label>
            <select
              name="type"
              value={filters.type ?? ''}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 text-sm"
            >
              <option value="">Tous les types</option>
              <option value="garage">🚗 Garage</option>
              <option value="cave">🍷 Cave</option>
              <option value="grenier">🏠 Grenier</option>
              <option value="box">📦 Box</option>
              <option value="autre">📋 Autre</option>
            </select>
          </div>

          {/* Prix */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Prix min (€/mois)</label>
              <input
                name="minPrice"
                type="number"
                value={filters.minPrice ?? ''}
                onChange={handleChange}
                placeholder="0"
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Prix max (€/mois)</label>
              <input
                name="maxPrice"
                type="number"
                value={filters.maxPrice ?? ''}
                onChange={handleChange}
                placeholder="500"
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          {/* Surface */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Surface minimum (m²)</label>
            <input
              name="minSurface"
              type="number"
              value={filters.minSurface ?? ''}
              onChange={handleChange}
              placeholder="0"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 border text-gray-600 text-sm py-2 rounded-xl hover:bg-gray-50"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleSearch}
              className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-xl hover:bg-blue-700"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
