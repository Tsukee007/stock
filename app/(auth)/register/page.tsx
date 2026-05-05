'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.full_name) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
        postal_code: form.postal_code,
        city: form.city,
      })
    }

    router.push('/')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoignez Nestock gratuitement</p>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Informations personnelles</p>
          <input name="full_name" value={form.full_name} onChange={handleChange}
            placeholder="Nom et prénom *"
            className="w-full border rounded-lg p-3" />
          <input name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="Email *"
            className="w-full border rounded-lg p-3" />
          <input name="phone" type="tel" value={form.phone} onChange={handleChange}
            placeholder="Téléphone"
            className="w-full border rounded-lg p-3" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresse</p>
          <input name="address" value={form.address} onChange={handleChange}
            placeholder="Adresse"
            className="w-full border rounded-lg p-3" />
          <div className="grid grid-cols-2 gap-2">
            <input name="postal_code" value={form.postal_code} onChange={handleChange}
              placeholder="Code postal"
              className="w-full border rounded-lg p-3" />
            <input name="city" value={form.city} onChange={handleChange}
              placeholder="Ville"
              className="w-full border rounded-lg p-3" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sécurité</p>
          <input name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="Mot de passe * (min. 6 caractères)"
            className="w-full border rounded-lg p-3" />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Se connecter</a>
        </p>
      </div>
    </div>
  )
}
