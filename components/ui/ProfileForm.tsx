'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  full_name?: string
  phone?: string
  address?: string
  postal_code?: string
  city?: string
}

export default function ProfileForm({ profile, userId }: { profile: Profile | null, userId: string }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    postal_code: profile?.postal_code || '',
    city: profile?.city || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.full_name.trim()) {
      setError('Le nom est obligatoire')
      return
    }
    setLoading(true)
    setError('')
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        postal_code: form.postal_code.trim(),
        city: form.city.trim(),
      })
      .eq('id', userId)

    if (updateError) {
      setError('Erreur lors de la sauvegarde')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="font-bold text-lg">Informations personnelles</h2>
      <p className="text-xs text-gray-500">Ces informations apparaissent sur vos contrats de location.</p>

      {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
      {saved && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">✅ Profil mis à jour !</p>}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
          <input name="full_name" value={form.full_name} onChange={handleChange}
            placeholder="Jean Dupont"
            className="w-full border rounded-lg p-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input name="phone" value={form.phone} onChange={handleChange}
            placeholder="06 12 34 56 78"
            className="w-full border rounded-lg p-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <input name="address" value={form.address} onChange={handleChange}
            placeholder="12 rue de la Paix"
            className="w-full border rounded-lg p-3 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
            <input name="postal_code" value={form.postal_code} onChange={handleChange}
              placeholder="75000"
              className="w-full border rounded-lg p-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input name="city" value={form.city} onChange={handleChange}
              placeholder="Paris"
              className="w-full border rounded-lg p-3 text-sm" />
          </div>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  )
}
