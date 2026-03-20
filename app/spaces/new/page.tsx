'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AddressSearch from '@/components/ui/AddressSearch'

export default function NewSpacePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    postal_code: '',
    lat: 0,
    lng: 0,
    surface_m2: '',
    type: 'garage',
    price_month: '',
    available_from: '',
    access_24h: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressSelect = (data: {
    address: string
    city: string
    postal_code: string
    lat: number
    lng: number
  }) => {
    setForm(prev => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    if (!form.lat || !form.lng) {
      setError('Veuillez sélectionner une adresse dans la liste')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('spaces').insert({
      title: form.title,
      description: form.description,
      address: form.address,
      city: form.city,
      postal_code: form.postal_code,
      lat: form.lat,
      lng: form.lng,
      surface_m2: parseFloat(form.surface_m2),
      type: form.type,
      price_month: parseFloat(form.price_month),
      available_from: form.available_from || null,
      access_24h: form.access_24h,
      owner_id: user.id,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center gap-3">
        <a href="/" className="text-gray-500 hover:text-blue-600">← Retour</a>
        <h1 className="text-xl font-bold text-blue-600">🗄️ Déposer une annonce</h1>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">

          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Ex: Garage spacieux avec électricité"
              className="w-full border rounded-lg p-3" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Décrivez votre espace..."
              rows={3} className="w-full border rounded-lg p-3" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'espace</label>
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
              <input name="surface_m2" value={form.surface_m2} onChange={handleChange}
                type="number" placeholder="20"
                className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix/mois (€)</label>
              <input name="price_month" value={form.price_month} onChange={handleChange}
                type="number" placeholder="80"
                className="w-full border rounded-lg p-3" />
            </div>
          </div>

          {/* Recherche adresse avec autocomplétion */}
          <AddressSearch onSelect={handleAddressSelect} />

          {/* Champs remplis automatiquement */}
          {form.address && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-blue-700">✅ Adresse sélectionnée</p>
              <p className="text-gray-600">📍 {form.address}</p>
              <div className="grid grid-cols-2 gap-2">
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
            <input name="available_from" value={form.available_from} onChange={handleChange}
              type="date"
              className="w-full border rounded-lg p-3" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="access_24h"
              checked={form.access_24h}
              onChange={e => setForm(prev => ({ ...prev, access_24h: e.target.checked }))}
              className="w-4 h-4" />
            <label htmlFor="access_24h" className="text-sm text-gray-700">Accès 24h/24</label>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Publication...' : '🚀 Publier mon annonce'}
          </button>

        </div>
      </div>
    </div>
  )
}
