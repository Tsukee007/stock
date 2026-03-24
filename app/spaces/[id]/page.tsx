import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

const { data: space } = await supabase
  .from('spaces')
  .select('*, profiles(full_name, avatar_url, rating_avg)')
  .eq('id', id)
  .single()

const { data: reviews } = await supabase
  .from('reviews')
  .select('*, profiles!reviews_author_id_fkey(full_name, avatar_url)')
  .eq('space_id', id)
  .order('created_at', { ascending: false })

  if (!space) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center gap-3">
        <a href="/" className="text-gray-500 hover:text-blue-600">← Retour</a>
        <h1 className="text-xl font-bold text-blue-600">🗄️ Nestock</h1>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Titre et type */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                {space.type}
              </span>
              <h2 className="text-2xl font-bold mt-2">{space.title}</h2>
              <p className="text-gray-500 mt-1">📍 {space.address}, {space.city}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{space.price_month}€</p>
              <p className="text-gray-400 text-sm">/mois</p>
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
              {space.profiles?.full_name?.[0] ?? '?'}
            </div>
            <div>
              <p className="font-semibold">{space.profiles?.full_name ?? 'Anonyme'}</p>
              {space.profiles?.rating_avg && (
                <p className="text-yellow-500 text-sm">⭐ {space.profiles.rating_avg}</p>
              )}
            </div>
          </div>
        </div>
{/* Avis */}
{reviews && reviews.length > 0 && (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="font-bold text-lg mb-4">
      ⭐ Avis ({reviews.length})
    </h3>
    <div className="space-y-4">
      {reviews.map(review => {
        const author = review.profiles as any
        return (
          <div key={review.id} className="border-b pb-4 last:border-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                {author?.full_name?.[0] ?? '?'}
              </div>
              <div>
                <p className="font-medium text-sm">{author?.full_name ?? 'Anonyme'}</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className="text-sm">
                      {star <= review.rating ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-400 text-xs ml-auto">
                {new Date(review.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {review.comment && (
              <p className="text-gray-600 text-sm pl-11">{review.comment}</p>
            )}
          </div>
        )
      })}
    </div>
  </div>
)}
        {/* Bouton contact */}
        <a href={`/api/contact/${space.id}`} className="block w-full bg-blue-600 text-white rounded-xl p-4 font-bold text-lg hover:bg-blue-700 text-center">
  📩 Contacter le propriétaire
</a>

      </div>
    </div>
  )
}
