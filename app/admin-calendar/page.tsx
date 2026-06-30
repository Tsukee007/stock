'use client'

import { useState, useEffect } from 'react'

interface Post {
  id: string
  date: string
  reseau: string
  angle: string
  contenu: string
  lien: string
  statut: string
  vues: number
  likes: number
  clics: number
  commentaires: number
}

const RESEAUX = ['tiktok', 'facebook', 'instagram', 'reddit']

const RESEAU_CONFIG: Record<string, { color: string, bg: string, label: string }> = {
  tiktok: { color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200', label: 'TikTok' },
  facebook: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Facebook' },
  instagram: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', label: 'Instagram' },
  reddit: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', label: 'Reddit' },
}

const STATUT_CONFIG: Record<string, { label: string, color: string }> = {
  a_publier: { label: 'A publier', color: 'bg-gray-100 text-gray-600' },
  publie: { label: 'Publie', color: 'bg-green-100 text-green-700' },
  en_cours: { label: 'En cours', color: 'bg-orange-100 text-orange-700' },
  reporte: { label: 'Reporte', color: 'bg-red-100 text-red-700' },
}

export default function AdminCalendar() {
  const [password, setPassword] = useState('')
  const [auth, setAuth] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState<'calendar' | 'stats'>('calendar')
  const [selectedReseau, setSelectedReseau] = useState('tous')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [seeding, setSeeding] = useState(false)

  async function login() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'get' })
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error); return }
      setPosts(json.data || [])
      setAuth(true)
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  async function seedData() {
    setSeeding(true)
    try {
      const res = await fetch('/api/admin-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'seed' })
      })
      const json = await res.json()
      if (res.ok) {
        const res2 = await fetch('/api/admin-calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, action: 'get' })
        })
        const json2 = await res2.json()
        setPosts(json2.data || [])
      }
    } catch {}
    finally { setSeeding(false) }
  }

  async function updatePost(post: Post) {
    await fetch('/api/admin-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'update', post })
    })
    setPosts(posts.map(p => p.id === post.id ? post : p))
    setSelectedPost(null)
  }

  const filteredPosts = selectedReseau === 'tous'
    ? posts
    : posts.filter(p => p.reseau === selectedReseau)

  // Grouper par semaine
  const byWeek: Record<string, Post[]> = {}
  filteredPosts.forEach(p => {
    const d = new Date(p.date)
    const week = `Semaine ${Math.ceil((d.getDate()) / 7)} — ${d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    if (!byWeek[week]) byWeek[week] = []
    byWeek[week].push(p)
  })

  // Stats globales
  const totalPublies = posts.filter(p => p.statut === 'publie').length
  const totalVues = posts.reduce((s, p) => s + (p.vues || 0), 0)
  const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0)
  const totalClics = posts.reduce((s, p) => s + (p.clics || 0), 0)

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-2xl font-bold text-blue-600">Nestock</span>
            <p className="text-gray-500 text-sm mt-2">Calendrier Editorial</p>
          </div>
          <div className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Mot de passe admin"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
            <button onClick={login} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors">
              {loading ? 'Connexion...' : 'Acceder'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xl font-bold text-blue-600">Nestock</span>
            <p className="text-gray-500 text-sm">Calendrier Editorial</p>
          </div>
          <div className="flex gap-3">
            {posts.length === 0 && (
              <button onClick={seedData} disabled={seeding}
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                {seeding ? 'Chargement...' : 'Initialiser le calendrier'}
              </button>
            )}
            <a href="/admin-waitlist" className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg">
              Waitlist
            </a>
          </div>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Posts publies', value: `${totalPublies}/${posts.length}`, color: 'text-green-600' },
            { label: 'Vues totales', value: totalVues.toLocaleString(), color: 'text-blue-600' },
            { label: 'Likes totaux', value: totalLikes.toLocaleString(), color: 'text-pink-600' },
            { label: 'Clics totaux', value: totalClics.toLocaleString(), color: 'text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {['calendar', 'stats'].map(v => (
            <button key={v} onClick={() => setView(v as 'calendar' | 'stats')}
              className={`text-sm px-4 py-2 rounded-lg border transition-colors ${view === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              {v === 'calendar' ? 'Calendrier' : 'Stats par reseau'}
            </button>
          ))}
        </div>

        {view === 'calendar' && (
          <>
            {/* Filtres reseau */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button onClick={() => setSelectedReseau('tous')}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${selectedReseau === 'tous' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>
                Tous
              </button>
              {RESEAUX.map(r => (
                <button key={r} onClick={() => setSelectedReseau(r)}
                  className={`text-sm px-4 py-2 rounded-full border transition-colors ${selectedReseau === r ? 'bg-gray-900 text-white border-gray-900' : `bg-white ${RESEAU_CONFIG[r].color} border-gray-200`}`}>
                  {RESEAU_CONFIG[r].label}
                </button>
              ))}
            </div>

            {/* Calendrier par semaine */}
            {Object.entries(byWeek).map(([week, weekPosts]) => (
              <div key={week} className="mb-8">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">{week}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {weekPosts.map(post => (
                    <div key={post.id}
                      className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-shadow ${RESEAU_CONFIG[post.reseau]?.bg || 'border-gray-200'}`}
                      onClick={() => setSelectedPost(post)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold ${RESEAU_CONFIG[post.reseau]?.color}`}>
                          {RESEAU_CONFIG[post.reseau]?.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_CONFIG[post.statut]?.color || 'bg-gray-100 text-gray-600'}`}>
                          {STATUT_CONFIG[post.statut]?.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(post.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-2">{post.angle}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{post.contenu}</div>
                      {post.statut === 'publie' && (
                        <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500">👁 {post.vues}</span>
                          <span className="text-xs text-gray-500">❤️ {post.likes}</span>
                          <span className="text-xs text-gray-500">🔗 {post.clics}</span>
                          <span className="text-xs text-gray-500">💬 {post.commentaires}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {view === 'stats' && (
          <div className="grid md:grid-cols-2 gap-6">
            {RESEAUX.map(reseau => {
              const reseauPosts = posts.filter(p => p.reseau === reseau)
              const publies = reseauPosts.filter(p => p.statut === 'publie').length
              const vues = reseauPosts.reduce((s, p) => s + (p.vues || 0), 0)
              const likes = reseauPosts.reduce((s, p) => s + (p.likes || 0), 0)
              const clics = reseauPosts.reduce((s, p) => s + (p.clics || 0), 0)
              const taux = publies > 0 && vues > 0 ? ((clics / vues) * 100).toFixed(1) : '0'
              return (
                <div key={reseau} className={`bg-white rounded-2xl p-6 shadow-sm border ${RESEAU_CONFIG[reseau].bg}`}>
                  <div className={`font-bold text-lg mb-4 ${RESEAU_CONFIG[reseau].color}`}>
                    {RESEAU_CONFIG[reseau].label}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Posts publies', value: `${publies}/${reseauPosts.length}` },
                      { label: 'Vues', value: vues.toLocaleString() },
                      { label: 'Likes', value: likes.toLocaleString() },
                      { label: 'Clics', value: clics.toLocaleString() },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-lg font-bold text-gray-900">{s.value}</div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    Taux de clic : <span className={`font-semibold ${RESEAU_CONFIG[reseau].color}`}>{taux}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal edition post */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Modifier le post</h3>
                <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
              </div>
              <div className={`text-xs font-semibold mb-1 ${RESEAU_CONFIG[selectedPost.reseau]?.color}`}>
                {RESEAU_CONFIG[selectedPost.reseau]?.label} — {new Date(selectedPost.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-4">{selectedPost.angle}</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
                  <select value={selectedPost.statut}
                    onChange={e => setSelectedPost({ ...selectedPost, statut: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.entries(STATUT_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                {selectedPost.statut === 'publie' && (
                  <div className="grid grid-cols-2 gap-3">
                    {['vues', 'likes', 'clics', 'commentaires'].map(field => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field}</label>
                        <input type="number" min="0"
                          value={(selectedPost as Record<string, number | string>)[field] as number}
                          onChange={e => setSelectedPost({ ...selectedPost, [field]: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setSelectedPost(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={() => updatePost(selectedPost)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
