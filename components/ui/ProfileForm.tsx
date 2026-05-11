python3 << 'PYEOF'
content = """'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  full_name?: string
  phone?: string
  address?: string
  postal_code?: string
  city?: string
}

export default function ProfileForm({ profile, userId, userEmail }: { profile: Profile | null, userId: string, userEmail: string }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)

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
    if (!form.full_name.trim()) { setError('Le nom est obligatoire'); return }
    if (!form.phone.trim()) { setError('Le téléphone est obligatoire'); return }
    if (!form.address.trim()) { setError('L adresse est obligatoire'); return }
    if (!form.postal_code.trim()) { setError('Le code postal est obligatoire'); return }
    if (!form.city.trim()) { setError('La ville est obligatoire'); return }

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

  const handleEmailChange = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setError('Email invalide')
      return
    }
    setLoading(true)
    const { error: emailError } = await supabase.auth.updateUser({ email: newEmail })
    if (emailError) {
      setError('Erreur : ' + emailError.message)
    } else {
      setEmailSent(true)
      setShowEmailForm(false)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="font-bold text-lg">Informations personnelles</h2>
      <p className="text-xs text-gray-500">Ces informations apparaissent sur vos contrats de location. Tous les champs sont obligatoires.</p>

      {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
      {saved && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">✅ Profil mis à jour !</p>}
      {emailSent && <p className="text-blue-600 text-sm bg-blue-50 p-3 rounded-lg">📧 Un email de confirmation a été envoyé à {newEmail}</p>}

      {/* Email */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-sm text-gray-600">{userEmail}</p>
          </div>
          <button onClick={() => setShowEmailForm(!showEmailForm)}
            className="text-xs text-blue-600 hover:underline">
            Modifier
          </button>
        </div>
        {showEmailForm && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              placeholder="nouveau@email.com"
              className="w-full border rounded-lg p-2 text-sm" />
            <p className="text-xs text-gray-400">Un email de confirmation sera envoyé à la nouvelle adresse.</p>
            <div className="flex gap-2">
              <button onClick={handleEmailChange} disabled={loading}
                className="flex-1 bg-blue-600 text-white rounded-lg p-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                Confirmer
              </button>
              <button onClick={() => setShowEmailForm(false)}
                className="flex-1 bg-gray-100 text-gray-600 rounded-lg p-2 text-sm hover:bg-gray-200">
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
          <input name="full_name" value={form.full_name} onChange={handleChange}
            placeholder="Jean Dupont"
            className="w-full border rounded-lg p-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
          <input name="phone" value={form.phone} onChange={handleChange}
            placeholder="06 12 34 56 78"
            className="w-full border rounded-lg p-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
          <input name="address" value={form.address} onChange={handleChange}
            placeholder="12 rue de la Paix"
            className="w-full border rounded-lg p-3 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
            <input name="postal_code" value={form.postal_code} onChange={handleChange}
              placeholder="75000"
              className="w-full border rounded-lg p-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
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
"""
with open('components/ui/ProfileForm.tsx', 'w') as f:
    f.write(content)
print('Done')
PYEOF