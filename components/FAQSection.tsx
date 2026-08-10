'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Est-ce que Nestock est gratuit ?',
    a: "L'inscription et la publication d'une annonce sont entièrement gratuites. Nestock prend une commission de 10% uniquement sur les transactions réalisées, à la charge du locataire."
  },
  {
    q: 'Le contrat est-il légalement valable ?',
    a: "Oui. Nestock génère un contrat de location au format légal français, signé électroniquement par les deux parties. Il a la même valeur juridique qu'une signature manuscrite, conformément à l'article 1366 du Code civil."
  },
  {
    q: 'Comment fonctionne le paiement ?',
    a: "Le paiement est mensuel et automatique via Stripe. Le locataire est prélevé chaque mois, et le propriétaire reçoit le loyer directement sur son compte bancaire, sans intermédiaire."
  },
  {
    q: 'Puis-je résilier à tout moment ?',
    a: "Oui. Propriétaire et locataire peuvent résilier avec un préavis de 15 jours via la messagerie Nestock."
  },
  {
    q: 'Mes données bancaires sont-elles sécurisées ?',
    a: "Oui. Nestock ne stocke aucune donnée bancaire. Tous les paiements sont traités par Stripe, certifié PCI-DSS niveau 1, le plus haut niveau de sécurité pour le traitement de paiements."
  },
  {
    q: "Quels types d'espaces peut-on louer ?",
    a: "Garage, cave, grenier, local, box, garde-meuble... Tout espace sécurisé et accessible peut être mis en location sur Nestock."
  },
  {
    q: 'Y a-t-il une assurance incluse ?',
    a: "Nestock ne fournit pas d'assurance directement. Nous recommandons aux deux parties de vérifier leur contrat d'assurance habitation, qui couvre souvent ce type de location."
  },
]

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Questions fréquentes</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
