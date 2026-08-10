'use client'

import { useState } from 'react'

const features = [
  {
    label: 'Carte interactive',
    desc: 'Trouvez des espaces autour de vous avec les prix en temps réel sur une carte interactive.',
    mockup: (
      <div className="w-full rounded-xl overflow-hidden shadow-lg">
        <img src="https://i.imgur.com/5Av8VUJ.png" alt="Carte interactive Nestock" className="w-full h-auto object-cover" />
      </div>
    )
  },
  {
    label: 'Messagerie',
    desc: 'Échangez directement avec le propriétaire ou le locataire via la messagerie intégrée.',
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
            <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-3 py-2 text-xs text-white max-w-xs" style={{ color: '#ffffff' }}>Oui, disponible dès maintenant !</div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 max-w-xs shadow-sm">Super, je suis intéressé pour 3 mois.</div>
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
    desc: 'Gérez toutes vos locations, contrats et quittances depuis un tableau de bord clair.',
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
            { label: 'Grenier - Paris 15e', status: 'Terminée', color: 'bg-gray-300', textColor: 'text-gray-400' },
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
    desc: 'Signez votre contrat de location électroniquement en quelques secondes, sans imprimante.',
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
              <span className="text-xs text-gray-600">J'accepte les termes du contrat</span>
            </div>
            <div className="bg-blue-600 rounded-lg py-2 text-center text-xs text-white font-medium" style={{ color: '#ffffff' }}>Signer électroniquement</div>
          </div>
        </div>
      </div>
    )
  },
  {
    label: 'Quittances auto',
    desc: 'Chaque paiement génère automatiquement une quittance téléchargeable et imprimable.',
    mockup: (
      <div className="w-full h-64 bg-gray-50 rounded-xl overflow-hidden p-4 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-600 mb-1">Quittances générées automatiquement</div>
        {[
          { ref: 'NST-FAC-2026-00018', date: 'Juin 2026', amount: '45,00 €' },
          { ref: 'NST-FAC-2026-00011', date: 'Mai 2026', amount: '45,00 €' },
          { ref: 'NST-FAC-2026-00005', date: 'Avril 2026', amount: '45,00 €' },
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

export default function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Une plateforme complète, pensée pour être simple et efficace.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            {features.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${activeFeature === i ? 'bg-white border-blue-200 shadow-md' : 'bg-white border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`font-semibold text-sm mb-1 ${activeFeature === i ? 'text-blue-600' : 'text-gray-800'}`}>{f.label}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
              </button>
            ))}
          </div>
          <div className="sticky top-24">{features[activeFeature].mockup}</div>
        </div>
      </div>
    </section>
  )
}
