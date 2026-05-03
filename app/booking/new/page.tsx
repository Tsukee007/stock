'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const spaceId = searchParams.get('space_id')
  const spaceTitle = searchParams.get('title')
  const spacePrice = searchParams.get('price')
  const supabase = createClient()

  const [form, setForm] = useState({
    start_date: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.start_date) {
      setError('Veuillez choisir une date de début')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const res = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        space_id: spaceId,
        start_date: form.start_date,
        message: form.message
      })
    })

    const data = await res.json()
    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push('/messages?booking_id=' + data.bookingId)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto p-4 md:p-6 space-y-6">

        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-blue-600">← Retour</button>
          <h1 className="text-xl font-bold">📦 Demande de réservation</h1>
        </div>

        {/* Récap espace */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-sm">Espace sélectionné</p>
          <p className="font-bold text-lg">{spaceTitle}</p>
          <p className="text-blue-600 font-semibold">{spacePrice}€/mois TTC</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début souhaitée
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={e => setForm(prev => ({ ...prev, start_date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message au propriétaire (optionnel)
            </label>
            <textarea
              value={form.message}
              onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Présentez-vous et expliquez votre besoin..."
              rows={4}
              className="w-full border rounded-lg p-3"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          {/* Recap processus */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm text-blue-700">
            <p className="font-semibold">Comment ça marche ?</p>
            <p>1️⃣ Vous envoyez votre demande</p>
            <p>2️⃣ Le propriétaire accepte ou refuse</p>
            <p>3️⃣ Vous signez le contrat en ligne</p>
            <p>4️⃣ Le propriétaire signe à son tour</p>
            <p>5️⃣ Le paiement est activé automatiquement</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.start_date}
            className="w-full bg-blue-600 text-white rounded-xl p-4 font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Envoi en cours...' : '📦 Envoyer ma demande'}
          </button>
        </div>

      </div>
    </div>
  )
}