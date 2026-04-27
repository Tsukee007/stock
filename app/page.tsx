import { createClient } from '@/lib/supabase/server'
import SearchFilters from '@/components/map/SearchFilters'
import MapWithList from '@/components/map/MapWithList'

type SearchParams = {
  city?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  minSurface?: string
  radius?: string
  lat?: string
  lng?: string
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('spaces')
    .select('id, title, city, lat, lng, price_month, type, surface_m2, address')
    .eq('is_active', true)

  if (filters.city && !filters.lat) query = query.ilike('city', `%${filters.city}%`)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.minPrice) query = query.gte('price_month', parseFloat(filters.minPrice))
  if (filters.maxPrice) query = query.lte('price_month', parseFloat(filters.maxPrice))
  if (filters.minSurface) query = query.gte('surface_m2', parseFloat(filters.minSurface))

  let { data: spaces } = await query

  if (spaces && filters.lat && filters.lng && filters.radius) {
    const lat = parseFloat(filters.lat)
    const lng = parseFloat(filters.lng)
    const radius = parseFloat(filters.radius)
    spaces = spaces.filter(s =>
      s.lat && s.lng && getDistanceKm(lat, lng, s.lat, s.lng) <= radius
    )
  }

  return (
    <main className="relative flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <SearchFilters initialFilters={filters} />
      <div className="flex-1 pt-16 md:pt-16">
        <MapWithList spaces={spaces ?? []} />
      </div>
    </main>
  )
}