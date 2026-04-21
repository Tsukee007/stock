'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <p className="text-4xl mb-4">📧</p>
        <h2 className="text-xl font-bold mb-2">Email envoyé !</h2>
        <p className="text-gray-600 text-sm">
          Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.
        </p>
        <a href="/login" className="text-blue-600 text-sm mt-4 inline-block">
          Retour à la connexion
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Mot de passe oublié</h1>
        <p className="text-gray-600 text-sm text-center mb-6">
          Entre ton email et on t'envoie un lien de réinitialisation
        </p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
        <p className="text-center text-sm mt-4">
          <a href="/login" className="text-blue-600">Retour à la connexion</a>
        </p>
      </div>
    </div>
  )
}