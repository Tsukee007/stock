import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReviewCard from '@/components/ui/ReviewCard'
import PhotoLightbox from '@/components/ui/PhotoLightbox'

export default async function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: space } = await supabase
    .from('spaces')
    .select('*, profiles(full_name, avatar_url, rating_avg), space_photos(url, position), price_ttc')
    .eq('id', id)
    .single()

  if (!space) notFound()

  const { data: spaceReviews } = await supabase
    .from('reviews')
    .select('*, profiles!reviews_author_id_fkey(full_name, avatar_url)')
    .eq('space_id', id)
    .order('created_at', { ascending: false })

  const photos = (space.space_photos as any[]) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Photos */}
{photos.length > 0 && (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <PhotoLightbox photos={photos} />
  </div>
)}

        {/* Titre et type */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium capitalize">
                {space.type}
              </span>
              <h2 className="text-2xl font-bold mt-2">{space.title}</h2>
              <p className="text-gray-500 mt-1">📍 {space.address}, {space.city}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{(space.price_ttc ?? Math.round(space.price_month * 1.10)).toFixed(2)}€</p>
              <p className="text-gray-400 text-sm">/mois TTC</p>
            </div>
          </div>
        </div>

        {/* Détails */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Caractéristiques</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-sm">Surface</p>
              <p className="font-bold">{space.surface_m2} m²</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-sm">Accès</p>
              <p className="font-bold">{space.access_24h ? '24h/24' : 'Horaires normaux'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-sm">Disponible dès</p>
              <p className="font-bold">{space.available_from ?? 'Immédiatement'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-sm">Type</p>
              <p className="font-bold capitalize">{space.type}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {space.description && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-600">{space.description}</p>
          </div>
        )}

        {/* Propriétaire */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-lg mb-3">Propriétaire</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
              {(space.profiles as any)?.full_name?.[0] ?? '?'}
            </div>
            <div>
              <p className="font-semibold">{(space.profiles as any)?.full_name ?? 'Anonyme'}</p>
              {(space.profiles as any)?.rating_avg && (
                <p className="text-yellow-500 text-sm">⭐ {(space.profiles as any).rating_avg}</p>
              )}
            </div>
          </div>
        </div>

        {/* Avis */}
        {spaceReviews && spaceReviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Avis</h3>
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                <span className="text-yellow-500 font-bold">
                  {(spaceReviews.reduce((sum, r) => sum + r.rating, 0) / spaceReviews.length).toFixed(1)}
                </span>
                <span className="text-yellow-500">⭐</span>
                <span className="text-gray-400 text-sm">({spaceReviews.length} avis)</span>
              </div>
            </div>
            <div className="space-y-3">
              {spaceReviews.map(review => (
                <ReviewCard key={review.id} review={review as any} />
              ))}
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h3 className="font-bold text-lg">Intéressé par cet espace ?</h3>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
            <p>✅ Envoyez une demande au propriétaire</p>
            <p>✅ Discutez des modalités par messagerie</p>
            <p>✅ Payez en ligne en toute sécurité</p>
          </div>
{isFullyBooked ? (
                <div className="w-full bg-gray-100 text-gray-500 rounded-xl p-4 text-center font-semibold">
                  🔒 Espace actuellement loué
                </div>
              ) : isEnding && endingDate ? (
                <div className="space-y-2">
                  <div className="w-full bg-orange-50 text-orange-700 rounded-xl p-3 text-center text-sm">
                    ⏳ Disponible le {new Date(endingDate).toLocaleDateString('fr-FR')}
                  </div>
                  <a href={'/booking/new?space_id=' + space['id'] + '&title=' + encodeURIComponent(space.title) + '&price=' + (space.price_ttc ?? space.price_month * 1.10).toFixed(2)}
  className="block w-full bg-blue-600 text-white rounded-xl p-4 font-bold text-lg hover:bg-blue-700 text-center">
  📦 Demander à réserver
</a>
          <a href={`/api/message/${space.id}`}
            className="block w-full border border-blue-600 text-blue-600 rounded-xl p-3 font-medium text-center hover:bg-blue-50">
            💬 Contacter le propriétaire
          </a>
          <p className="text-center text-xs text-gray-400">Gratuit et sans engagement</p>
        </div>

      </div>
    </div>
  )
}