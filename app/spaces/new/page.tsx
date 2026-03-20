'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    lat: '',
    lng: '',
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

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('spaces').insert({
      ...form,
      owner_id: user.id,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      surface_m2: parseFloat(form.surface_m2),
      price_month: parseFloat(form.price_month),
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input name="address" value={form.address} onChange={handleChange}
              placeholder="12 rue de la Paix"
              className="w-full border rounded-lg p-3" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input name="city" value={form.city} onChange={handleChange}
              placeholder="Paris"
              className="w-full border rounded-lg p-3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input name="lat" value={form.lat} onChange={handleChange}
                type="number" placeholder="48.8566"
                className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input name="lng" value={form.lng} onChange={handleChange}
                type="number" placeholder="2.3522"
                className="w-full border rounded-lg p-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponible à partir du</label>
            <input name="available_from" value={form.available_from} onChange={handleChange}
              type="date"
              className="w-full border rounded-lg p-3" />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700">
            {loading ? 'Publication...' : '🚀 Publier mon annonce'}
          </button>

        </div>
      </div>
    </div>
  )
}
