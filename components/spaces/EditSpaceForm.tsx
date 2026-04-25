'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AddressSearch from '@/components/ui/AddressSearch'
import PhotoUpload from '@/components/ui/PhotoUpload'

export default function EditSpaceForm({ space }: { space: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<string[]>(
    space.space_photos?.map((p: any) => p.url) ?? []
  )
  const [form, setForm] = useState({
    title: space.title ?? '',
    description: space.description ?? '',
    type: space.type ?? 'garage',
    surface_m2: space.surface_m2?.toString() ?? '',
    price_month: space.price_month?.toString() ?? '',
    address: space.address ?? '',
    city: space.city ?? '',
    postal_code: space.postal_code ?? '',
    lat: space.lat ?? 0,
    lng: space.lng ?? 0,
    available_from: space.available_from ?? '',
    access_24h: space.access_24h ?? false,
    is_active: space.is_active ?? true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressSelect = (data: any) => {
    setForm(prev => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase
      .from('spaces')
      .update({
        title: form.title,
        description: form.description,
        type: form.type,
        surface_m2: parseFloat(form.surface_m2),
        price_month: parseFloat(form.price_month),
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        lat: form.lat,
        lng: form.lng,
        available_from: form.available_from || null,
        access_24h: form.access_24h,
        is_active: form.is_active,
      })
      .eq('id', space.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Mettre à jour les photos
    await supabase.from('space_photos').delete().eq('space_id', space.id)
    if (photos.length > 0) {
      await supabase.from('space_photos').insert(
        photos.map((url, i) => ({ space_id: space.id, url, position: i }))
      )
    }

    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <PhotoUpload
        spaceId={space.id}
        existingPhotos={photos}
        onUpdate={setPhotos}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input name="title" value={form.title} onChange={handleChange}
          className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange}
          rows={3} className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select name="type" value={form.type} onChange={handleChange}
          className="w-full border rounded-lg p-3">
          <option value="garage">Garage</option>
          <option value="cave">Cave</option>
          <option value="grenier">Grenier</option>
          <option value="box">Box</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
          <input name="surface_m2" type="number" value={form.surface_m2} onChange={handleChange}
            className="w-full border rounded-lg p-3" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix/mois (€)</label>
          <input name="price_month" type="number" value={form.price_month} onChange={handleChange}
            className="w-full border rounded-lg p-3" />
        </div>
      </div>

      <AddressSearch onSelect={handleAddressSelect} />

      {form.address && (
        <div className="bg-blue-50 rounded-lg p-3 text-sm">
          <p className="font-medium text-blue-700">✅ {form.address}</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ville</label>
              <input name="city" value={form.city} onChange={handleChange}
                className="w-full border rounded-lg p-2 text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Code postal</label>
              <input name="postal_code" value={form.postal_code} onChange={handleChange}
                className="w-full border rounded-lg p-2 text-sm bg-white" />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Disponible à partir du</label>
        <input name="available_from" type="date" value={form.available_from} onChange={handleChange}
          className="w-full border rounded-lg p-3" />
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="access_24h"
          checked={form.access_24h}
          onChange={e => setForm(prev => ({ ...prev, access_24h: e.target.checked }))}
          className="w-4 h-4" />
        <label htmlFor="access_24h" className="text-sm">Accès 24h/24</label>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="is_active"
          checked={form.is_active}
          onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
          className="w-4 h-4" />
        <label htmlFor="is_active" className="text-sm">Annonce visible</label>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Mise à jour...' : '✅ Enregistrer les modifications'}
      </button>
    </div>
  )
}