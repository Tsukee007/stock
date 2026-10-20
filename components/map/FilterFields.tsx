'use client'

import { useFilters } from './FiltersContext'

const RADIUS_OPTIONS = [2, 5, 10, 20, 30, 50, 100]

// Champs de filtre : dans le menu déroulant (mobile, petit écran) et dans le panneau de gauche (grand écran)
export default function FilterFields({ onDone }: { onDone?: () => void }) {
  const { filters, setFilters, cityQuery, apply, reset } = useFilters()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="space-y-4">

      {/* Disponibilité */}
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.available === '1'}
          onChange={e => setFilters(prev => ({ ...prev, available: e.target.checked ? '1' : undefined }))}
          className="w-4 h-4 accent-blue-600"
        />
        Seulement les espaces à louer
      </label>

      {/* Rayon de recherche */}
      {filters.lat && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            📏 Rayon autour de {cityQuery}
          </label>
          <div className="flex gap-2 flex-wrap">
            {RADIUS_OPTIONS.map(r => (
              <button
                type="button"
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
          type="button"
          onClick={() => { reset(); onDone?.() }}
          className="flex-1 border text-gray-600 text-sm py-2 rounded-xl hover:bg-gray-50"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={() => { apply(); onDone?.() }}
          className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-xl hover:bg-blue-700"
        >
          Appliquer
        </button>
      </div>
    </div>
  )
}
