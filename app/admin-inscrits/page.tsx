'use client'

import { useState, useEffect } from 'react'

interface Inscrit {
  id: string
  email: string
  full_name: string
  phone: string
  city: string
  created_at: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  spaces: number
  bookings: number
}

const date = (d: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '')

export default function AdminInscrits() {
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
      const res = await fetch('/api/admin-inscrits', {
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-2xl font-bold text-blue-600">Nestock</span>
            <p className="text-gray-500 text-sm mt-2">Inscrits</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryLogin(password)}
              placeholder="Mot de passe admin"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
            <button type="button"
              onClick={() => tryLogin(password)}
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
  const confirmes = data.filter(d => d.email_confirmed_at).length
  const proprietaires = data.filter(d => d.spaces > 0).length
  const locataires = data.filter(d => d.bookings > 0).length
  const depuis30j = data.filter(d => Date.now() - new Date(d.created_at).getTime() < 30 * 86400000).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <span className="text-xl font-bold text-blue-600">Nestock Admin</span>
          <div className="flex flex-wrap gap-3">
            <span className="text-sm bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium">Inscrits</span>
            <a href="/admin-calendar" className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg">Calendrier</a>
            <a href="/admin-tests" className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg">Tests</a>
            <button type="button" onClick={() => { localStorage.removeItem('nestock_admin_pwd'); setData(null) }} className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg">
              Deconnexion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Comptes inscrits', value: total, sub: `dont ${depuis30j} ces 30 derniers jours` },
            { label: 'Adresse e-mail confirmee', value: confirmes, sub: `${total - confirmes} en attente` },
            { label: 'Ont publie un espace', value: proprietaires, sub: 'proprietaires' },
            { label: 'Ont fait une reservation', value: locataires, sub: 'locataires' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-1">{s.value}</div>
              <div className="text-sm text-gray-700">{s.label}</div>
              <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Liste des inscrits</h3>
            <span className="text-sm text-gray-500">{total} compte{total > 1 ? 's' : ''}, du plus recent au plus ancien</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Nom</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Ville</th>
                  <th className="px-6 py-3 text-left">Inscrit le</th>
                  <th className="px-6 py-3 text-left">Email confirme</th>
                  <th className="px-6 py-3 text-left">Derniere connexion</th>
                  <th className="px-6 py-3 text-left">Espaces / Resa.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.full_name || <span className="text-gray-400 font-normal">non renseigne</span>}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}{u.phone && <div className="text-xs text-gray-400">{u.phone}</div>}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.city}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{date(u.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${u.email_confirmed_at ? 'text-green-600' : 'text-orange-500'}`}>
                        {u.email_confirmed_at ? 'Oui' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{date(u.last_sign_in_at) || 'jamais'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.spaces} / {u.bookings}</td>
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
