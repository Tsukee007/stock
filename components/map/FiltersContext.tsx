'use client'

import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'

export type Filters = {
  city?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  minSurface?: string
  radius?: string
  lat?: string
  lng?: string
  available?: string
}

type FiltersContextValue = {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  cityQuery: string
  setCityQuery: (value: string) => void
  apply: (next?: Filters) => void
  reset: () => void
}

const FiltersContext = createContext<FiltersContextValue | null>(null)

// Filtres partagés entre la barre de recherche (en haut) et le panneau de filtres (à gauche sur grand écran)
export function FiltersProvider({ initialFilters, children }: { initialFilters: Filters; children: React.ReactNode }) {
  const router = useRouter()
  const [filters, setFilters] = useState(initialFilters)
  const [cityQuery, setCityQuery] = useState(initialFilters.city ?? '')

  const apply = (next: Filters = filters) => {
    const params = new URLSearchParams()
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const reset = () => {
    setFilters({})
    setCityQuery('')
    router.push('/', { scroll: false })
  }

  return (
    <FiltersContext.Provider value={{ filters, setFilters, cityQuery, setCityQuery, apply, reset }}>
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const value = useContext(FiltersContext)
  if (!value) throw new Error('useFilters doit être utilisé dans FiltersProvider')
  return value
}
