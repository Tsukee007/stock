'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AddressSearch from '@/components/ui/AddressSearch'
import PhotoUpload from '@/components/ui/PhotoUpload'
import PriceSimulator from '@/components/ui/PriceSimulator'

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export default function NewSpacePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [stripeReady, setStripeReady] = useState(false)
  const [error, setError] = useState('')
  const [spaceId] = useState(generateUUID())
  const [photos, setPhotos] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    postal_code: '',
    lat: 0,
    lng: 0,
    surface_m2: '',
    type: 'garage',
    price_month: '',
    available_from: '',
    access_24h: false,
  })

  useEffect(() => {
    checkStripeConnect()
  }, [])

  const checkStripeConnect = async () => {
    const res = await fetch('/api/stripe/connect')
    const data = await res.json()
    setStripeReady(data.connected)
    setChecking(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressSelect = (data: any) => {
    setForm(prev => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    if (!form.lat || !form.lng) {
      setError('Veuillez sélectionner une adresse dans la liste')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const priceHT = parseFloat(form.price_month)
    const nestock = priceHT * 0.10
    const subtotal = priceHT + nestock
    const stripeFees = subtotal * 0.015 + 0.25
    const priceTTC = Math.ceil((subtotal + stripeFees) * 100) / 100

    const { error: insertError } = await supabase.from('spaces').insert({
      id: spaceId,
      title: form.title,
      description: form.description,
      address: form.address,
      city: form.city,
      postal_code: form.postal_code,
      lat: form.lat,
      lng: form.lng,
      surface_m2: parseFloat(form.surface_m2),
      type: form.type,
      price_month: priceTTC,
      available_from: form.available_from || null,
      access_24h: form.access_24h,
      owner_id: user.id,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    if (photos.length > 0) {
      await supabase.from('space_photos').insert(
        photos.map((url, i) => ({ space_id: spaceId, url, position: i }))
      )
    }

    router.push('/')
    setLoading(false)
  }

  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Vérification de votre compte...</p>
    </div>
  )

  if (!stripeReady) return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-500 hover:text-blue-600">← Retour</a>
          <h1 className="text-xl font-bold">Déposer une annonce</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 text-center">
          <p className="text-5xl">💳</p>
          <h2 className="text-xl font-bold">Connectez votre compte Stripe</h2>
          <p className="text-gray-600 text-sm">
            Avant de déposer une annonce, vous devez connecter votre compte Stripe 
            pour recevoir vos paiements automatiquement.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700 text-left space-y-1">
            <p>✅ Recevez vos loyers automatiquement</p>
            <p>✅ Virements directs sur votre IBAN</p>
            <p>✅ Tableau de bord Stripe dédié</p>
            <p>✅ Sécurisé et certifié PCI-DSS</p>
          </div>
          <a href="/stripe/connect"
            className="block w-full bg-blue-600 text-white rounded-xl p-4 font-bold hover:bg-blue-700">
            🔗 Connecter mon compte Stripe
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="text-gray-500 hover:text-blue-600">← Retour</a>
          <h1 className="text-xl font-bold">🗄️ Déposer une annonce</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

          <PhotoUpload spaceId={spaceId} existingPhotos={photos} onUpdate={setPhotos} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Ex: Garage spacieux avec électricité"
              className="w-full border rounded-lg p-3" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Décrivez votre espace..."
              rows={3} className="w-full border rounded-lg p-3" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'espace</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full border rounded-lg p-3">
              <option value="garage">Garage</option>
              <option value="cave">Cave</option>
              <option value="grenier">Grenier</option>
              <option value="box">Box</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
              <input name="surface_m2" type="number" value={form.surface_m2} onChange={handleChange}
                placeholder="20" className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix souhaité (€/mois)</label>
              <input name="price_month" type="number" value={form.price_month} onChange={handleChange}
                placeholder="100" className="w-full border rounded-lg p-3" />
            </div>
          </div>

          {form.price_month && parseFloat(form.price_month) > 0 && (
            <PriceSimulator ownerPrice={parseFloat(form.price_month)} />
          )}

          <AddressSearch onSelect={handleAddressSelect} />

          {form.address && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-blue-700">✅ Adresse sélectionnée</p>
              <p className="text-gray-600">📍 {form.address}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ville</label>
                  <input name="city" value={form.city} onChange={handleChange}
                    className="w-full border rounded-lg p-2 text-sm bg-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Code postal</label>
                  <input name="postal_code" value={form.postal_code} onChange={handleChange}
                    className="w-full border rounded-lg p-2 text-sm bg-white" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponible à partir du</label>
            <input name="available_from" type="date" value={form.available_from} onChange={handleChange}
              className="w-full border rounded-lg p-3" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="access_24h" checked={form.access_24h}
              onChange={e => setForm(prev => ({ ...prev, access_24h: e.target.checked }))}
              className="w-4 h-4" />
            <label htmlFor="access_24h" className="text-sm text-gray-700">Accès 24h/24</label>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Publication...' : '🚀 Publier mon annonce'}
          </button>
        </div>
      </div>
    </div>
  )
}
