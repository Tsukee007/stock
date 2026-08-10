'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.55)), url('/images/hero-garage.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative z-10">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Connexion</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700"
          style={{ color: '#ffffff' }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p className="text-center text-sm mt-4 text-gray-500">
          <a href="/forgot-password" className="text-blue-600">Mot de passe oublié ?</a>
        </p>
        <p className="text-center text-sm mt-2 text-gray-500">
          Pas encore de compte ? <a href="/register" className="text-blue-600">S'inscrire</a>
        </p>
      </div>
    </div>
  )
}
