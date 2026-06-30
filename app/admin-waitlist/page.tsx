'use client'

import { useState, useEffect } from 'react'

interface Inscrit {
  id: string
  prenom: string
  email: string
  interet: string
  consent_email: boolean
  consent_rgpd: boolean
  created_at: string
}

export default function AdminWaitlist() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<Inscrit[] | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('nestock_admin_pwd')
    if (saved) tryLogin(saved)
  }, [])

  async function tryLogin(pwd: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      })
      const json = await res.json()
      if (!res.ok) {
        localStorage.removeItem('nestock_admin_pwd')
        setError(json.error || 'Erreur')
      } else {
        localStorage.setItem('nestock_admin_pwd', pwd)
        setData(json.data)
      }
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  async function handleLogin() {
    setError('')
    tryLogin(password)
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-2xl font-bold text-blue-600">Nestock</span>
            <p className="text-gray-500 text-sm mt-2">Dashboard Waitlist</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Mot de passe admin"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'Connexion...' : 'Acceder'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const total = data.length
  const louer = data.filter(d => d.interet === 'louer').length
  const proposer = data.filter(d => d.interet === 'proposer').length
  const lesDeux = data.filter(d => d.interet === 'les_deux').length
  const consentEmail = data.filter(d => d.consent_email).length
  const tauxConsent = total > 0 ? Math.round((consentEmail / total) * 100) : 0

  // Evolution par jour
  const parJour: Record<string, number> = {}
  data.forEach(d => {
    const jour = new Date(d.created_at).toLocaleDateString('fr-FR')
    parJour[jour] = (parJour[jour] || 0) + 1
  })
  const joursKeys = Object.keys(parJour).slice(-7)

  const maxParJour = Math.max(...Object.values(parJour), 1)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xl font-bold text-blue-600">Nestock</span>
            <p className="text-gray-500 text-sm">Dashboard Waitlist</p>
          </div>
          <button onClick={() => setData(null)} className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg">
            Deconnexion
          </button>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-1">{total}</div>
            <div className="text-sm text-gray-500">Total inscrits</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-1">{louer}</div>
            <div className="text-sm text-gray-500">Veulent louer</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-orange-500 mb-1">{proposer}</div>
            <div className="text-sm text-gray-500">Veulent proposer</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-1">{lesDeux}</div>
            <div className="text-sm text-gray-500">Les deux</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Repartition */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-6">Repartition des interets</h3>
            <div className="space-y-4">
              {[
                { label: 'Louer un espace', value: louer, color: 'bg-blue-500' },
                { label: 'Proposer un espace', value: proposer, color: 'bg-orange-500' },
                { label: 'Les deux', value: lesDeux, color: 'bg-purple-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: total > 0 ? `${(item.value / total) * 100}%` : '0%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consentement email */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-6">Consentement email marketing</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
                    strokeDasharray={`${tauxConsent} ${100 - tauxConsent}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{tauxConsent}%</span>
                  <span className="text-xs text-gray-500">consent</span>
                </div>
              </div>
            </div>
            <div className="flex justify-around mt-4">
              <div className="text-center">
                <div className="font-semibold text-green-600">{consentEmail}</div>
                <div className="text-xs text-gray-500">Accepte</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-400">{total - consentEmail}</div>
                <div className="text-xs text-gray-500">Refuse</div>
              </div>
            </div>
          </div>
        </div>

        {/* Evolution 7 derniers jours */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-gray-900 mb-6">Evolution des inscriptions (7 derniers jours)</h3>
          {joursKeys.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune inscription pour le moment</p>
          ) : (
            <div className="flex items-end gap-3 h-32">
              {joursKeys.map((jour, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">{parJour[jour]}</span>
                  <div className="w-full bg-blue-100 rounded-t-lg" style={{ height: `${(parJour[jour] / maxParJour) * 80}px`, minHeight: '4px' }}>
                    <div className="w-full h-full bg-blue-500 rounded-t-lg"></div>
                  </div>
                  <span className="text-xs text-gray-400">{jour.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liste des inscrits */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Liste des inscrits</h3>
            <span className="text-sm text-gray-500">{total} personne{total > 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Prenom</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Interet</th>
                  <th className="px-6 py-3 text-left">Email mkg</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.slice().reverse().map((inscrit, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{inscrit.prenom}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inscrit.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        inscrit.interet === 'louer' ? 'bg-blue-100 text-blue-700' :
                        inscrit.interet === 'proposer' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {inscrit.interet === 'louer' ? 'Louer' : inscrit.interet === 'proposer' ? 'Proposer' : 'Les deux'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${inscrit.consent_email ? 'text-green-600' : 'text-gray-400'}`}>
                        {inscrit.consent_email ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(inscrit.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
