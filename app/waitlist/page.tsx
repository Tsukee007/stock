'use client'

import { useState } from 'react'


export default function WaitlistPage() {
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [interet, setInteret] = useState('')
  const [consentEmail, setConsentEmail] = useState(false)
  const [consentRgpd, setConsentRgpd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [activeFeature, setActiveFeature] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleSubmit() {
    setError('')
    if (!prenom || !email || !interet || !consentRgpd) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, email, interet, consent_email: consentEmail, consent_rgpd: consentRgpd })
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

  const faqs = [
    { q: 'Est-ce que Nestock est gratuit ?', a: 'La publication d une annonce est gratuite pour les proprietaires. Une commission de 10% est appliquee uniquement lors d un paiement effectif, a la charge du locataire.' },
    { q: 'Le contrat est-il legalement valable ?', a: 'Oui. Nestock genere un contrat de location au format legal francais, signe electroniquement par les deux parties. Il est valable devant les tribunaux.' },
    { q: 'Comment fonctionne le paiement ?', a: 'Le paiement est mensuel et automatique via Stripe. Le locataire est preleve chaque mois, et le proprietaire recoit le loyer directement sur son compte bancaire.' },
    { q: 'Puis-je resilier a tout moment ?', a: 'Oui. Le locataire peut resilier avec 15 jours de preavis. Le proprietaire recoit une notification et la location prend fin a l echeance du preavis.' },
    { q: 'Mes donnees bancaires sont-elles securisees ?', a: 'Absolument. Nestock ne stocke aucune donnee bancaire. Tous les paiements transitent par Stripe, certifie PCI-DSS niveau 1, le plus haut niveau de securite.' },
    { q: 'Quels types d espaces peut-on louer ?', a: 'Garage, cave, grenier, local, box, garde-meuble... Tout espace securise et accessible peut etre mis en location sur Nestock.' },
    { q: 'Y a-t-il une assurance incluse ?', a: 'Nestock ne fournit pas d assurance directement. Nous recommandons aux deux parties de verifier leur contrat d assurance habitation qui couvre souvent ce type de location.' },
  ]

  const features = [
    {
      label: 'Carte interactive',
      desc: 'Trouvez des espaces autour de vous avec les prix en temps reel sur une carte interactive.',
      mockup: (
        <div className="w-full rounded-xl overflow-hidden shadow-lg">
          <img src="https://i.imgur.com/5Av8VUJ.png" alt="Carte interactive Nestock" className="w-full h-auto object-cover" />
        </div>
      )
    },
    {
      label: 'Messagerie',
      desc: 'Echangez directement avec le proprietaire ou le locataire via la messagerie integree.',
      mockup: (
        <div className="w-full h-64 bg-gray-50 rounded-xl overflow-hidden p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">M</div>
            <div>
              <div className="text-sm font-semibold text-gray-800">Marie D.</div>
              <div className="text-xs text-green-500">En ligne</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 max-w-xs shadow-sm">Bonjour, votre garage est toujours disponible ?</div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-3 py-2 text-xs text-white max-w-xs">Oui, disponible des maintenant !</div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 max-w-xs shadow-sm">Super, je suis interesse pour 3 mois.</div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-2 text-xs text-gray-400">Votre message...</div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Dashboard',
      desc: 'Gerez toutes vos locations, contrats et quittances depuis un tableau de bord clair.',
      mockup: (
        <div className="w-full h-64 bg-gray-50 rounded-xl overflow-hidden p-4">
          <div className="text-sm font-semibold text-gray-800 mb-3">Mon tableau de bord</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white rounded-lg p-2 shadow-sm text-center">
              <div className="text-lg font-bold text-blue-600">2</div>
              <div className="text-xs text-gray-500">Locations</div>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm text-center">
              <div className="text-lg font-bold text-green-600">240€</div>
              <div className="text-xs text-gray-500">Ce mois</div>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm text-center">
              <div className="text-lg font-bold text-purple-600">6</div>
              <div className="text-xs text-gray-500">Quittances</div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Garage - Lyon 6e', status: 'Active', color: 'bg-green-500', textColor: 'text-green-600' },
              { label: 'Cave - Bordeaux', status: 'Active', color: 'bg-green-500', textColor: 'text-green-600' },
              { label: 'Grenier - Paris 15e', status: 'Terminee', color: 'bg-gray-300', textColor: 'text-gray-400' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-2 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                  <span className="text-xs text-gray-700">{item.label}</span>
                </div>
                <span className={`text-xs font-medium ${item.textColor}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      label: 'Contrat & Signature',
      desc: 'Signez votre contrat de location electroniquement en quelques secondes, sans imprimante.',
      mockup: (
        <div className="w-full h-64 bg-gray-50 rounded-xl overflow-hidden p-4 flex flex-col">
          <div className="bg-white rounded-lg p-3 shadow-sm flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-800">Contrat NST-CTR-2026-00042</span>
            </div>
            <div className="h-2 bg-gray-100 rounded w-full"></div>
            <div className="h-2 bg-gray-100 rounded w-4/5"></div>
            <div className="h-2 bg-gray-100 rounded w-full"></div>
            <div className="h-2 bg-gray-100 rounded w-3/5"></div>
            <div className="mt-auto pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">J accepte les termes du contrat</span>
              </div>
              <div className="bg-blue-600 rounded-lg py-2 text-center text-xs text-white font-medium">Signer electroniquement</div>
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Quittances auto',
      desc: 'Chaque paiement genere automatiquement une quittance telechargeable et imprimable.',
      mockup: (
        <div className="w-full h-64 bg-gray-50 rounded-xl overflow-hidden p-4 flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-600 mb-1">Quittances generees automatiquement</div>
          {[
            { ref: 'NST-FAC-2026-00018', date: 'Juin 2026', amount: '45,00 EUR' },
            { ref: 'NST-FAC-2026-00011', date: 'Mai 2026', amount: '45,00 EUR' },
            { ref: 'NST-FAC-2026-00005', date: 'Avril 2026', amount: '45,00 EUR' },
          ].map((q, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-800">{q.ref}</div>
                <div className="text-xs text-gray-400">{q.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{q.amount}</span>
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="text-xl font-bold text-blue-600">Nestock</a>
          <a href="#inscription" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Rejoindre la liste
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-24 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">Bientot disponible</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">Louez ou trouvez un espace de stockage chez des particuliers</h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">Nestock connecte les proprietaires qui ont un garage, une cave ou un grenier inutilise avec les personnes qui cherchent un espace de stockage abordable et securise.</p>
          <a href="#inscription" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg shadow-sm">Etre notifie au lancement</a>
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
                {[
                  { n: '1', title: 'Publiez votre annonce', desc: 'Decrivez votre espace, ajoutez des photos, fixez votre prix. Moins de 5 minutes.' },
                  { n: '2', title: 'Recevez des demandes', desc: 'Les locataires vous contactent via la messagerie integree. Vous choisissez librement.' },
                  { n: '3', title: 'Encaissez chaque mois', desc: 'Contrat electronique, paiement automatique, quittances generees. Rien a gerer.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{s.n}</div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{s.title}</div>
                      <div className="text-gray-500 text-sm leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-6">Vous cherchez un espace</div>
              <div className="space-y-8">
                {[
                  { n: '1', title: 'Cherchez par ville', desc: 'Carte interactive avec les espaces disponibles et les prix en temps reel.' },
                  { n: '2', title: 'Contactez le proprietaire', desc: 'Messagerie directe, visite, accord. Tout se passe sur la plateforme.' },
                  { n: '3', title: 'Signez et stockez', desc: 'Contrat legal en ligne, paiement securise, resiliation avec 15 jours de preavis.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-4">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{s.n}</div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{s.title}</div>
                      <div className="text-gray-500 text-sm leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITES */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Une plateforme complete, pensee pour etre simple et efficace.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-3">
              {features.map((f, i) => (
                <button key={i} onClick={() => setActiveFeature(i)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${activeFeature === i ? 'bg-white border-blue-200 shadow-md' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                  <div className={`font-semibold text-sm mb-1 ${activeFeature === i ? 'text-blue-600' : 'text-gray-800'}`}>{f.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
                </button>
              ))}
            </div>
            <div className="sticky top-24">{features[activeFeature].mockup}</div>
          </div>
        </div>
      </section>

      {/* AVANTAGES + STRIPE + TARIFS */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi Nestock ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Securite, transparence et simplicite au coeur de la plateforme.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">100% securise</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Contrat electronique legal, paiement securise, quittances automatiques.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">2x moins cher</h3>
              <p className="text-gray-500 text-xs leading-relaxed">En moyenne deux fois moins cher qu un box de self-stockage pour la meme surface.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Simple et rapide</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Annonce en 5 minutes, contrat signe en ligne, tout gere depuis votre telephone.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-indigo-100">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-4 text-indigo-600" viewBox="0 0 60 25" fill="currentColor">
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V6.27h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 6.9-5.65 6.9zm-.95-9.99c-.93 0-1.48.35-1.96.8l.02 6.12c.45.4.98.7 1.94.7 1.49 0 2.48-1.61 2.48-3.79 0-2.13-1-3.83-2.48-3.83zM28.24 5.07c1.36 0 2.2-.88 2.2-2.03C30.44.97 29.6 0 28.24 0c-1.35 0-2.2.97-2.2 2.04 0 1.15.85 2.03 2.2 2.03zm2.07 15.22h-4.17V6.27h4.17v14.02zM21.77 7l-.27-1.44h-3.7v14.47h4.1v-9.86c.92-1.2 2.47-1 2.95-.84V6.27c-.5-.18-2.27-.44-3.08.73zM12.15 6.27l-.1.57c-.72-.8-2.07-1.07-3.43-1.07C5.15 5.77 3 8.3 3 11.03c0 3.2 2.01 4.86 4.62 4.86 1.28 0 2.43-.37 3.13-.98v.48c0 1.77-.96 2.73-3.02 2.73-1.48 0-2.87-.47-3.82-1.03l-.01 3.39c1.05.46 2.62.79 4.17.79 3.88 0 6.64-1.85 6.64-6.48V6.27h-2.56zm-2.98 7.3c-1.18 0-1.95-.77-1.95-2.07 0-1.27.77-2.07 1.95-2.07 1.17 0 1.92.8 1.92 2.07 0 1.3-.75 2.07-1.92 2.07z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Paiements Stripe</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Vos donnees bancaires ne transitent jamais par Nestock.</p>
              <div className="mt-3 flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-xs text-green-600 font-medium">Certifie PCI-DSS niveau 1</span>
              </div>
            </div>
          </div>

          {/* TRANSPARENCE TARIFAIRE */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparence totale sur les frais</h3>
              <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">Aucune surprise. Voici exactement comment se repartissent les charges sur chaque paiement.</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="bg-blue-600 px-6 py-4">
                  <div className="text-white font-semibold">Exemple pour un loyer de 50 EUR/mois</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: 'Loyer hors charges', sub: 'Prix fixe par le proprietaire', amount: '50,00 EUR', amountColor: 'text-gray-900' },
                    { label: 'Commission Nestock', sub: '10% — gestion de la plateforme, contrats, quittances', amount: '+ 5,00 EUR', amountColor: 'text-orange-500' },
                    { label: 'Frais Stripe', sub: '1,5% + 0,25EUR — traitement du paiement securise', amount: '+ 1,03 EUR', amountColor: 'text-orange-500' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{row.label}</div>
                        <div className="text-xs text-gray-400">{row.sub}</div>
                      </div>
                      <div className={`font-semibold ${row.amountColor}`}>{row.amount}</div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-6 py-4 bg-blue-50">
                    <div>
                      <div className="font-semibold text-gray-900">Total TTC locataire</div>
                      <div className="text-xs text-gray-400">Montant debite chaque mois</div>
                    </div>
                    <div className="font-bold text-blue-600 text-lg">56,03 EUR</div>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4 bg-green-50">
                    <div>
                      <div className="font-semibold text-gray-900">Revenu net proprietaire</div>
                      <div className="text-xs text-gray-400">Vire directement sur votre compte bancaire</div>
                    </div>
                    <div className="font-bold text-green-600 text-lg">50,00 EUR</div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400">Les frais sont a la charge du locataire. Le proprietaire recoit 100% du loyer affiche.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Les phases de lancement</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Nestock se deploie progressivement pour garantir la meilleure experience possible.</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
            <div className="space-y-10">
              {[
                { icon: 'check', color: 'bg-blue-600', label: 'Phase 1 — Construction', badge: 'Termine', badgeColor: 'bg-blue-100 text-blue-700', desc: 'Developpement de la plateforme : authentification, annonces, carte interactive, messagerie, contrats electroniques, paiements Stripe.' },
                { icon: 'dot', color: 'bg-blue-600', label: 'Phase 2 — Liste d attente', badge: 'En cours', badgeColor: 'bg-orange-100 text-orange-700', desc: 'Constitution d une communaute de premiers utilisateurs. Les inscrits auront un acces prioritaire et des offres exclusives au lancement.' },
                { n: '3', color: 'bg-gray-200', label: 'Phase 3 — Beta privee', badge: 'A venir', badgeColor: 'bg-gray-100 text-gray-500', desc: 'Ouverture a un groupe limite de proprietaires et locataires selectionnes parmi la liste d attente. Retours utilisateurs et ajustements.' },
                { n: '4', color: 'bg-gray-200', label: 'Phase 4 — Lancement public', badge: 'A venir', badgeColor: 'bg-gray-100 text-gray-500', desc: 'Ouverture de la plateforme au grand public. Disponible dans toute la France avec paiements en production et support complet.' },
              ].map((phase, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div className={`w-12 h-12 ${phase.color} rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-md`}>
                    {phase.icon === 'check' && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    {phase.icon === 'dot' && <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /></svg>}
                    {phase.n && <span className="text-gray-500 font-bold text-sm">{phase.n}</span>}
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{phase.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${phase.badgeColor}`}>{phase.badge}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions frequentes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Tout ce que vous devez savoir avant de vous lancer.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A PROPOS */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">A propos de Nestock</h2>
          <p className="text-gray-500 leading-relaxed mb-6">Nestock est une startup francaise nee d un constat simple : des millions de garages, caves et greniers restent inutilises en France, pendant que des milliers de personnes paient des fortunes pour stocker leurs affaires dans des box impersonnels.</p>
          <p className="text-gray-500 leading-relaxed mb-6">Notre mission est de creer un lien de confiance entre ces deux mondes. Grace a une plateforme 100% digitale, nous rendons la location d espace entre particuliers aussi simple, securisee et transparente que possible.</p>
          <p className="text-gray-500 leading-relaxed mb-10">Contrats electroniques, paiements automatiques, quittances generees — tout est pense pour que proprietaires et locataires puissent se concentrer sur l essentiel, sans paperasse ni stress.</p>
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-10">
            {[
              { value: '100%', label: 'Francais' },
              { value: 'RGPD', label: 'Conforme' },
              { value: 'Stripe', label: 'Paiements' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xl font-bold text-blue-600 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
          <a href="mailto:contact@nestock.pro" className="text-blue-600 hover:underline text-sm">contact@nestock.pro</a>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section id="inscription" className="py-24 px-6 bg-blue-600">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">Rejoins la liste d attente</h2>
            <p className="text-blue-100 leading-relaxed">Sois notifie en priorite au lancement et profite des offres reservees aux premiers inscrits.</p>
          </div>
          {success ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tu es sur la liste !</h3>
              <p className="text-gray-500 text-sm">Merci {prenom}, on te contactera en priorite au lancement de Nestock.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prenom <span className="text-red-500">*</span></label>
                <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ton prenom" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.fr" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Je suis interesse pour <span className="text-red-500">*</span></label>
                <select value={interet} onChange={e => setInteret(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white">
                  <option value="">-- Choisir une option --</option>
                  <option value="louer">Louer un espace de stockage</option>
                  <option value="proposer">Proposer mon espace de stockage</option>
                  <option value="les_deux">Les deux</option>
                </select>
              </div>
              <div className="flex items-start gap-3 pt-1">
                <input type="checkbox" id="rgpd" checked={consentRgpd} onChange={e => setConsentRgpd(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0" />
                <label htmlFor="rgpd" className="text-sm text-gray-600 leading-relaxed">J accepte que Nestock conserve mes donnees pour me contacter au lancement. <span className="text-red-500">*</span></label>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" id="consent_email" checked={consentEmail} onChange={e => setConsentEmail(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0" />
                <label htmlFor="consent_email" className="text-sm text-gray-600 leading-relaxed">J accepte de recevoir des emails de Nestock. Desinscription possible a tout moment.</label>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
              <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors">
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
      <footer className="py-8 px-6 bg-gray-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white font-bold text-lg">Nestock</span>
          <p className="text-gray-500 text-sm">2026 Nestock. Tous droits reserves.</p>
          <a href="mailto:contact@nestock.pro" className="text-gray-500 hover:text-white text-sm transition-colors">contact@nestock.pro</a>
        </div>
      </footer>

    </div>
  )
}
