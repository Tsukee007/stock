'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Créer un compte</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Nom complet"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700"
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
        <p className="text-center text-sm mt-4 text-gray-500">
          Déjà un compte ? <a href="/login" className="text-blue-600">Se connecter</a>
        </p>
      </div>
    </div>
  )
}
