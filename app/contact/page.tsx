'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    await fetch('/api/contact-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
        <p className="text-4xl mb-4">✅</p>
        <h2 className="text-xl font-bold mb-2">Message envoyé !</h2>
        <p className="text-gray-600">Nous vous répondrons dans les plus brefs délais.</p>
        <a href="/" className="text-blue-600 text-sm mt-4 inline-block">Retour à l'accueil</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-4xl mb-3">✉️</p>
          <h1 className="text-2xl font-bold mb-2">Contactez-nous</h1>
          <p className="text-gray-600">Une question ? Un problème ? Nous sommes là pour vous aider.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Votre nom"
              className="w-full border rounded-lg p-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="votre@email.com"
              className="w-full border rounded-lg p-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
            <select name="subject" value={form.subject} onChange={handleChange}
              className="w-full border rounded-lg p-3">
              <option value="">Choisir un sujet</option>
              <option value="question">Question générale</option>
              <option value="probleme">Problème technique</option>
              <option value="litige">Litige entre utilisateurs</option>
              <option value="suggestion">Suggestion d'amélioration</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange}
              placeholder="Décrivez votre demande..."
              rows={5} className="w-full border rounded-lg p-3" />
          </div>
          <button onClick={handleSubmit} disabled={loading || !form.message || !form.email}
            className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
            style={{ color: '#ffffff' }}>
            {loading ? 'Envoi...' : 'Envoyer le message'}
          </button>
          <p className="text-xs text-gray-500 leading-relaxed">
            Votre nom, votre e-mail et votre message sont utilisés par Nestock uniquement pour répondre à votre demande.
            Conformément au RGPD, vous pouvez y accéder, les rectifier ou les faire supprimer en écrivant à{' '}
            <a href="mailto:contact@nestock.pro" className="text-blue-600 hover:underline">contact@nestock.pro</a>.{' '}
            <a href="/confidentialite" className="text-blue-600 hover:underline">Politique de confidentialité</a>
          </p>
        </div>

      </div>

      <footer className="bg-white border-t border-gray-100 text-gray-500 py-10 px-4 mt-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <p className="text-gray-900 font-bold text-lg">Nestock</p>
            <p className="text-xs text-gray-400">contact@nestock.pro</p>
            <a href="https://climate.stripe.com/ShwhDB" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs hover:underline transition" style={{ color: '#6b7280' }}>
              <svg className="w-4 h-4 shrink-0" style={{ color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
              1 % de nos revenus finance l'élimination du CO₂ (Stripe Climate)
            </a>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Produit</p>
            <a href="/about" className="block hover:text-gray-900 transition">À propos</a>
            <a href="/contact" className="block hover:text-gray-900 transition">Contact</a>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Compte</p>
            <a href="/register" className="block hover:text-gray-900 transition">S'inscrire</a>
            <a href="/login" className="block hover:text-gray-900 transition">Se connecter</a>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Légal</p>
            <a href="/cgu" className="block hover:text-gray-900 transition">CGU</a>
            <a href="/confidentialite" className="block hover:text-gray-900 transition">Confidentialité</a>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>2026 Nestock - Tous droits réservés</p>
        </div>
      </footer>

    </div>
  )
}
