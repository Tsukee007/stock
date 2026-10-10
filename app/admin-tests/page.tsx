'use client'

import { useCallback, useEffect, useState } from 'react'

// Suivi des tests du site, alimenté par l'agent Testeur d'AI Framework
// (table test_tracking, voir supabase/test_tracking.sql). Textes pensés pour
// tous les publics : le détail technique reste replié.

interface TestRow {
  test_id: string
  title: string
  category: string | null
  description: string | null
  actions: string[] | null
  status: string
  summary: string | null
  details: string | null
  source: string | null
  mission_id: number | null
  result_date: string | null
  synced_at: string
}

const DONE = ['OK', 'Échec', 'Partiel', 'Bloqué']

const STATUS: Record<string, { label: string; pill: string; bar: string }> = {
  'OK': { label: 'Réussi', pill: 'bg-green-50 text-green-700 border-green-200', bar: 'bg-green-500' },
  'Échec': { label: 'Problème trouvé', pill: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500' },
  'Partiel': { label: 'Vérifié en partie', pill: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400' },
  'Bloqué': { label: 'Pas pu être vérifié', pill: 'bg-gray-100 text-gray-600 border-gray-200', bar: 'bg-gray-400' },
  'En cours': { label: 'En cours', pill: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500' },
  'À faire': { label: 'À faire', pill: 'bg-white text-gray-500 border-gray-200', bar: 'bg-gray-200' },
}

const TABS = [
  { key: 'todo', label: 'À réaliser', match: (s: string) => s !== 'En cours' && !DONE.includes(s) },
  { key: 'running', label: 'En cours', match: (s: string) => s === 'En cours' },
  { key: 'done', label: 'Terminés', match: (s: string) => DONE.includes(s) },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function AdminTests() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<TestRow[] | null>(null)
  const [tab, setTab] = useState<TabKey>('done')

  const tryLogin = useCallback(async (pwd: string, silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      const json = await res.json()
      if (!res.ok) {
        localStorage.removeItem('nestock_admin_pwd')
        setData(null)
        setError(json.error || 'Erreur')
      } else {
        localStorage.setItem('nestock_admin_pwd', pwd)
        setData(json.data)
      }
    } catch {
      if (!silent) setError('Erreur serveur')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('nestock_admin_pwd')
    if (saved) tryLogin(saved)
  }, [tryLogin])

  // Les résultats arrivent pendant que le Testeur travaille : rafraîchissement toutes les 30 s.
  useEffect(() => {
    if (!data) return
    const timer = setInterval(() => {
      const saved = localStorage.getItem('nestock_admin_pwd')
      if (saved) tryLogin(saved, true)
    }, 30_000)
    return () => clearInterval(timer)
  }, [data, tryLogin])

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-2xl font-bold text-blue-600">Nestock</span>
            <p className="text-gray-500 text-sm mt-2">Suivi des tests</p>
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
            <button
              type="button"
              onClick={() => tryLogin(password)}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'Connexion...' : 'Accéder'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const total = data.length
  const count = (s: string) => data.filter(t => t.status === s).length
  const inTab = (key: TabKey, s: string) => TABS.some(x => x.key === key && x.match(s))
  const tabCount = (key: TabKey) => data.filter(t => inTab(key, t.status)).length
  const done = tabCount('done')
  const lastSync = data.length ? new Date(data[0].synced_at).toLocaleString('fr-FR') : null
  const visible = data.filter(t => inTab(tab, t.status))

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="text-xl font-bold text-blue-600">Nestock Admin</span>
          <div className="flex flex-wrap gap-2">
            <a href="/admin/inscrits" className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg">Inscrits</a>
            <a href="/admin-calendar" className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg">Calendrier</a>
            <span className="text-sm bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium">Tests</span>
            <button type="button" onClick={() => { localStorage.removeItem('nestock_admin_pwd'); setData(null) }} className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg">
              Déconnexion
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-lg font-semibold text-gray-900">Suivi des tests du site</h1>
            <span className="text-sm text-gray-500">{done} terminé{done > 1 ? 's' : ''} sur {total}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Chaque test vérifie une chose précise sur le site. Le résultat le plus récent est affiché.
            {lastSync && <> Dernière mise à jour : {lastSync}.</>}
          </p>
          {total > 0 && (
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 gap-0.5" role="img" aria-label={`${done} tests terminés sur ${total}`}>
              {['OK', 'Partiel', 'Échec', 'Bloqué', 'En cours'].map(s => count(s) > 0 && (
                <span key={s} className={STATUS[s].bar} style={{ width: `${(count(s) / total) * 100}%` }} title={`${STATUS[s].label} : ${count(s)}`} />
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
            {DONE.filter(s => count(s) > 0).map(s => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS[s].bar}`} />{STATUS[s].label} : {count(s)}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrer les tests">
          {TABS.map(t => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={`text-sm px-4 py-2 rounded-full border ${tab === t.key ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:text-gray-800'}`}
            >
              {t.label} ({tabCount(t.key)})
            </button>
          ))}
        </div>

        {total === 0 && <p className="text-sm text-gray-500">Aucun test publié pour l&apos;instant.</p>}
        {total > 0 && visible.length === 0 && <p className="text-sm text-gray-500">Aucun test dans cette liste.</p>}

        <div className="space-y-3">
          {visible.map((t, i) => {
            const status = STATUS[t.status] ?? STATUS['À faire']
            const finished = DONE.includes(t.status)
            const newCategory = i === 0 || visible[i - 1].category !== t.category
            return (
              <div key={t.test_id}>
                {newCategory && <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-5 mb-2">{t.category || 'Autres'}</h2>}
                <article className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="font-semibold text-gray-900">{t.title}</h3>
                  <dl className="mt-2 grid grid-cols-1 sm:grid-cols-[90px_1fr] gap-x-3 gap-y-1.5 text-sm leading-relaxed">
                    <dt className="font-medium text-gray-500">Objectif</dt>
                    <dd className="text-gray-800 mb-1 sm:mb-0">{t.description || '—'}</dd>
                    <dt className="font-medium text-gray-500">Actions</dt>
                    <dd className="text-gray-800 mb-1 sm:mb-0">
                      {t.actions?.length
                        ? <ol className="list-decimal pl-5 space-y-0.5">{t.actions.map(a => <li key={a}>{a}</li>)}</ol>
                        : <span className="text-gray-500">Les étapes détaillées sont dans le cahier de tests.</span>}
                    </dd>
                    <dt className="font-medium text-gray-500">Statut</dt>
                    <dd className="mb-1 sm:mb-0">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${status.pill}`}>{status.label}</span>
                      {finished && t.result_date && <span className="text-xs text-gray-400 ml-2">({t.result_date})</span>}
                    </dd>
                    <dt className="font-medium text-gray-500">Résultat</dt>
                    <dd className="text-gray-800">
                      {finished
                        ? (t.summary ?? 'Résultat noté dans le cahier de tests ; il sera reformulé simplement au prochain passage du Testeur.')
                        : t.status === 'En cours' ? 'Le Testeur est en train de faire ce test.' : 'Pas encore testé.'}
                    </dd>
                  </dl>
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer text-gray-400">Pour l&apos;équipe technique</summary>
                    <p className="text-gray-500 mt-1 break-words">
                      {t.details?.startsWith(`Test ${t.test_id}`) ? t.details : `Test ${t.test_id}. ${finished && t.details ? t.details : ''}`}
                    </p>
                  </details>
                </article>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
