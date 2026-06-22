'use client'

import { useState } from 'react'

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

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">Nestock</span>
          <a href="#inscription" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Rejoindre la liste
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-24 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
            Bientot disponible
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Louez ou trouvez un espace de stockage<br className="hidden md:block" /> chez des particuliers
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Nestock connecte les proprietaires qui ont un garage, une cave ou un grenier inutilise avec les personnes qui cherchent un espace de stockage abordable et securise.
          </p>
          <a href="#inscription" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg shadow-sm">
            Etre notifie au lancement
          </a>
          <p className="text-sm text-gray-400 mt-4">Gratuit. Sans engagement. RGPD.</p>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ca marche ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Une plateforme simple et securisee pour louer ou trouver un espace en quelques minutes.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <div className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-6">Vous avez un espace inutilise</div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Publiez votre annonce</div>
                    <div className="text-gray-500 text-sm leading-relaxed">Decrivez votre espace, ajoutez des photos, fixez votre prix. Moins de 5 minutes.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Recevez des demandes</div>
                    <div className="text-gray-500 text-sm leading-relaxed">Les locataires vous contactent via la messagerie integree. Vous choisissez librement.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Encaissez chaque mois</div>
                    <div className="text-gray-500 text-sm leading-relaxed">Contrat electronique, paiement automatique, quittances generees. Rien a gerer.</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-6">Vous cherchez un espace</div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Cherchez par ville</div>
                    <div className="text-gray-500 text-sm leading-relaxed">Carte interactive avec les espaces disponibles et les prix en temps reel.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Contactez le proprietaire</div>
                    <div className="text-gray-500 text-sm leading-relaxed">Messagerie directe, visite, accord. Tout se passe sur la plateforme.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Signez et stockez</div>
                    <div className="text-gray-500 text-sm leading-relaxed">Contrat legal en ligne, paiement securise, resiliation avec 15 jours de preavis.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi Nestock ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Tout ce dont vous avez besoin pour louer en toute serenite.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">100% securise</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Contrat electronique au format legal francais, paiement via Stripe, quittances automatiques.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2x moins cher</h3>
              <p className="text-gray-500 text-sm leading-relaxed">En moyenne deux fois moins cher qu un box de self-stockage classique pour la meme surface.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Simple et rapide</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Annonce en 5 minutes, contrat signe en ligne, tout gere depuis votre telephone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Les phases de lancement</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Nestock se deploie progressivement pour garantir la meilleure experience possible.</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
            <div className="space-y-10">

              <div className="flex gap-6 relative">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">Phase 1 — Construction</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Termine</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">Developpement de la plateforme : authentification, annonces, carte interactive, messagerie, contrats electroniques, paiements Stripe.</p>
                </div>
              </div>

              <div className="flex gap-6 relative">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">Phase 2 — Liste d attente</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">En cours</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">Constitution d une communaute de premiers utilisateurs. Les inscrits auront un acces prioritaire et des offres exclusives au lancement.</p>
                </div>
              </div>

              <div className="flex gap-6 relative">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                  <span className="text-gray-500 font-bold text-sm">3</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">Phase 3 — Beta privee</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">A venir</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">Ouverture a un groupe limite de proprietaires et locataires selectionnes parmi la liste d attente. Retours utilisateurs et ajustements.</p>
                </div>
              </div>

              <div className="flex gap-6 relative">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                  <span className="text-gray-500 font-bold text-sm">4</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">Phase 4 — Lancement public</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">A venir</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">Ouverture de la plateforme au grand public. Disponible dans toute la France avec paiements en production et support complet.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section id="inscription" className="py-24 px-6 bg-blue-600">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">Rejoins la liste d attente</h2>
            <p className="text-blue-100 leading-relaxed">
              Sois notifie en priorite au lancement et profite des offres reservees aux premiers inscrits.
            </p>
          </div>

          {success ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tu es sur la liste !</h3>
              <p className="text-gray-500 text-sm">Merci {prenom}, on te contactera en priorite au lancement de Nestock.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 space-y-4">
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
              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="rgpd"
                  checked={consentRgpd}
                  onChange={e => setConsentRgpd(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
                />
                <label htmlFor="rgpd" className="text-sm text-gray-600 leading-relaxed">
                  J accepte que Nestock conserve mes donnees pour me contacter au lancement. <span className="text-red-500">*</span>
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
                  J accepte de recevoir des emails de Nestock. Desincription possible a tout moment.
                </label>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {loading ? 'Inscription...' : "Je rejoins la liste d attente"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Conformement au RGPD, suppression de tes donnees sur simple demande a{' '}
                <a href="mailto:contact@nestock.pro" className="hover:underline">contact@nestock.pro</a>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 bg-gray-900 text-center">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white font-bold text-lg">Nestock</span>
          <p className="text-gray-500 text-sm">2026 Nestock. Tous droits reserves.</p>
          <a href="mailto:contact@nestock.pro" className="text-gray-500 hover:text-white text-sm transition-colors">contact@nestock.pro</a>
        </div>
      </footer>

    </div>
  )
}
