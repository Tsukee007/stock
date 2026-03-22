import SpacesMap from '@/components/map/SpacesMap'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, title, city, lat, lng, price_month, type')
    .eq('is_active', true)

  return (
    <main style={{ height: 'calc(100vh - 64px)' }}>
      <SpacesMap spaces={spaces ?? []} />
    </main>
  )
}
