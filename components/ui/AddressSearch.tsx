'use client'

import { useState, useRef, useEffect } from 'react'

type AddressResult = {
  place_name: string
  center: [number, number]
  context: Array<{ id: string; text: string }>
  text: string
}

type Props = {
  onSelect: (data: {
    address: string
    city: string
    postal_code: string
    lat: number
    lng: number
  }) => void
}

export default function AddressSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AddressResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)


  const search = async (value: string) => {
    if (value.length < 3) {
      setResults([])
      return
    }
    setLoading(true)
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=fr&language=fr&types=address`
    )
    const data = await res.json()
    setResults(data.features ?? [])
    setShowResults(true)
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => search(value), 400)
  }

  const handleSelect = (result: AddressResult) => {
    const city = result.context?.find(c => c.id.startsWith('place'))?.text ?? ''
    const postal_code = result.context?.find(c => c.id.startsWith('postcode'))?.text ?? ''
    const address = `${result.text} ${result.context?.find(c => c.id.startsWith('address'))?.text ?? ''}`.trim()

    setQuery(result.place_name)
    setShowResults(false)
    onSelect({
      address: address || result.place_name,
      city,
      postal_code,
      lat: result.center[1],
      lng: result.center[0],
    })
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Rechercher l'adresse
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Ex: 12 rue de la Paix, Paris..."
          className="w-full border rounded-lg p-3 pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0 text-sm"
            >
              <span className="text-gray-400 mr-2">📍</span>
              {result.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
