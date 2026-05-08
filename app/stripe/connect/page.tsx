'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function StripeConnectPage() {
  const [status, setStatus] = useState<'loading' | 'not_connected' | 'connected' | 'error'>('loading')
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const refresh = searchParams.get('refresh')
  const spaceId = searchParams.get('space_id')

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    const res = await fetch('/api/stripe/connect')
    const data = await res.json()
    if (data.connected) {
      setStatus('connected')
    } else {
      setStatus('not_connected')
    }
  }

  const startOnboarding = async () => {
    setRedirecting(true)
    const res = await fetch('/api/stripe/connect', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setStatus('error')
      setRedirecting(false)
    }
  }

  if (status === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-3xl mb-3">⏳</p>
        <p className="text-gray-600">Vérification de votre compte...</p>
      </div>
    </div>
  )

  if (status === 'connected' || success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center space-y-4">
        <p className="text-5xl">🎉</p>
        <h1 className="text-2xl font-bold text-green-600">Compte Stripe connecté !</h1>
        <p className="text-gray-600">Vous pouvez maintenant recevoir des paiements directement sur votre compte bancaire.</p>
        <div className="bg-green-50 rounded-lg p-4 text-sm text-green-700 text-left space-y-1">
          <p>✅ Paiements automatiques activés</p>
          <p>✅ Virements directs sur votre compte</p>
          <p>✅ Tableau de bord Stripe disponible</p>
        </div>
        <button onClick={() => router.push(spaceId ? '/spaces/' + spaceId : '/spaces/new')}
          className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700">
          {spaceId ? 'Voir mon annonce →' : 'Deposer mon annonce →'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto p-4 md:p-6 space-y-6">

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-500 hover:text-blue-600">← Dashboard</a>
          <h1 className="text-xl font-bold">💳 Connexion Stripe</h1>
        </div>

        {refresh && (
          <div className="bg-yellow-50 rounded-xl p-4 text-yellow-700 text-sm">
            ⚠️ La connexion a été interrompue. Veuillez recommencer.
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold">Pourquoi connecter Stripe ?</h2>
          <p className="text-gray-600 text-sm">
            Nestock utilise <strong>Stripe Connect</strong> pour vous verser automatiquement 
            vos revenus de location directement sur votre compte bancaire, en toute sécurité.
          </p>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold text-sm">Paiements automatiques</p>
                <p className="text-gray-500 text-xs">Votre loyer est versé automatiquement chaque mois</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-semibold text-sm">Sécurisé et certifié</p>
                <p className="text-gray-500 text-xs">Stripe est certifié PCI-DSS, la norme de sécurité bancaire internationale</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-semibold text-sm">Tableau de bord dédié</p>
                <p className="text-gray-500 text-xs">Suivez vos revenus en temps réel depuis votre espace Stripe</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🏦</span>
              <div>
                <p className="font-semibold text-sm">Virement sur votre IBAN</p>
                <p className="text-gray-500 text-xs">Vos gains sont virés directement sur le compte bancaire de votre choix</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm text-blue-700">
          <p className="font-semibold">📋 Ce dont vous aurez besoin :</p>
          <p>• Votre pièce d'identité (passeport ou carte d'identité)</p>
          <p>• Votre IBAN pour recevoir les virements</p>
          <p>• Environ 5 minutes pour compléter le formulaire</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 text-sm">
          <p className="font-semibold mb-2">💡 Transparence sur les frais</p>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Prix que vous fixez</span>
              <span className="font-semibold">100%</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>Commission Nestock</span>
              <span>+ 10%</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>Frais Stripe (~1.5% + 0.25€)</span>
              <span>+ ~4%</span>
            </div>
            <div className="border-t pt-1 flex justify-between font-semibold">
              <span>Prix payé par le locataire</span>
              <span>~114%</span>
            </div>
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Vous recevez</span>
              <span>100% de votre prix</span>
            </div>
          </div>
        </div>

        <button
          onClick={startOnboarding}
          disabled={redirecting}
          className="w-full bg-blue-600 text-white rounded-xl p-4 font-bold hover:bg-blue-700 disabled:opacity-50 text-lg"
        >
          {redirecting ? '⏳ Redirection vers Stripe...' : '🔗 Connecter mon compte Stripe'}
        </button>

        <p className="text-center text-xs text-gray-400">
          Vous serez redirigé vers Stripe, une plateforme de paiement sécurisée. 
          Nestock ne stocke jamais vos informations bancaires.
        </p>

      </div>
    </div>
  )
}
