'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function WaitlistPage() {
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [consentEmail, setConsentEmail] = useState(false)
  const [consentRgpd, setConsentRgpd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    if (!prenom || !email || !consentRgpd) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, email, consent_email: consentEmail, consent_rgpd: consentRgpd })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Une erreur est survenue, reessaie.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Tu es sur la liste !</h1>
          <p className="text-gray-500 mb-8">Merci {prenom}, on te contactera en priorite au lancement de Nestock.</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm">Retour a accueil</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <span className="text-2xl font-bold text-blue-600">Nestock</span>
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">Sois parmi les premiers</h1>
          <p className="text-gray-500 leading-relaxed">
            Nestock arrive bientot. Inscris-toi pour etre notifie en priorite et profiter des offres de lancement.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prenom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
              placeholder="Ton prenom"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="rgpd"
              checked={consentRgpd}
              onChange={e => setConsentRgpd(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
            />
            <label htmlFor="rgpd" className="text-sm text-gray-600 leading-relaxed">
              J accepte que Nestock conserve mon prenom et mon email pour me contacter lors du lancement.{' '}
              <span className="text-red-500">*</span>{' '}
              <Link href="/confidentialite" className="text-blue-600 hover:underline">Politique de confidentialite</Link>
            </label>
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent_email"
              checked={consentEmail}
              onChange={e => setConsentEmail(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
            />
            <label htmlFor="consent_email" className="text-sm text-gray-600 leading-relaxed">
              J accepte de recevoir des emails de Nestock. Tu peux te desinscrire a tout moment.
            </label>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Inscription...' : "Je rejoins la liste d attente"}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Conformement au RGPD, tu peux demander la suppression de tes donnees a tout moment en ecrivant a{' '}
            <a href="mailto:contact@nestock.pro" className="hover:underline">contact@nestock.pro</a>
          </p>
        </div>
      </div>
    </div>
  )
}
