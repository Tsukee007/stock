'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { authErrorMessage } from '@/lib/authErrors'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse e-mail.')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Adresse du site ouvert (nestock.pro en ligne, localhost:3000 pour la base de test)
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) {
      setError(authErrorMessage(error))
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
          Vérifiez votre boîte mail (et les spams) et cliquez sur le lien pour réinitialiser votre mot de passe.
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
          Saisissez votre adresse e-mail : nous vous enverrons un lien de réinitialisation.
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