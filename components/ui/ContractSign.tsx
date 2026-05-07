'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  contract: any
  isOwner: boolean
  isRenter: boolean
  bookingId: string
  spacePrice: number
}

export default function ContractSign({ contract, isOwner, isRenter, bookingId, spacePrice }: Props) {
  const [form, setForm] = useState({
    name: '',
    birth_date: '',
  })
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const canOwnerSign = isOwner && !contract.owner_signed
  const canRenterSign = isRenter && contract.owner_signed && !contract.renter_signed
  const alreadySigned = (isOwner && contract.owner_signed) || (isRenter && contract.renter_signed)
  const fullySigned = contract.status === 'fully_signed'

  const handleSign = async () => {
    if (!checked) { setError('Veuillez cocher la case pour confirmer votre accord'); return }
    if (!form.name.trim()) { setError('Veuillez entrer votre nom complet'); return }
    if (!form.birth_date) { setError('Veuillez entrer votre date de naissance'); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/contracts/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractId: contract.id,
        bookingId,
        signatureName: form.name.trim(),
        birthDate: form.birth_date,
        isOwner,
      })
    })

    const data = await res.json()
    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    if (!isOwner && data.checkoutUrl) {
      window.location.href = data.checkoutUrl
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  // Contrat entièrement signé
  if (fullySigned) {
    return (
      <div className="bg-green-50 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-green-700 text-lg">✅ Contrat signé par les deux parties</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Signature propriétaire</p>
            <p className="font-semibold">{contract.owner_signature_name}</p>
            <p className="text-gray-400 text-xs">{new Date(contract.owner_signed_at).toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Signature locataire</p>
            <p className="font-semibold">{contract.renter_signature_name}</p>
            <p className="text-gray-400 text-xs">{new Date(contract.renter_signed_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">⏳ En attente du paiement</p>
          <p>Le contrat est signé. La location sera active après validation du paiement mensuel.</p>
        </div>
        <a href="/dashboard" className="block text-center text-sm text-blue-600 hover:underline">
          Retour au dashboard →
        </a>
      </div>
    )
  }

  // Déjà signé par cet utilisateur
  if (alreadySigned) {
    return (
      <div className="bg-blue-50 rounded-xl p-6 space-y-3">
        <h3 className="font-bold text-blue-700">✅ Vous avez déjà signé ce contrat</h3>
        {isOwner && !contract.renter_signed && (
          <p className="text-sm text-gray-600">En attente de la signature du locataire. Un email et une notification lui ont été envoyés.</p>
        )}
      </div>
    )
  }

  // Locataire attend que le propriétaire signe
  if (isRenter && !contract.owner_signed) {
    return (
      <div className="bg-yellow-50 rounded-xl p-6">
        <h3 className="font-bold text-yellow-700">⏳ En attente de la signature du propriétaire</h3>
        <p className="text-sm text-gray-600 mt-2">Vous recevrez une notification dès que le propriétaire aura signé.</p>
      </div>
    )
  }

  if (!canOwnerSign && !canRenterSign) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h3 className="font-bold text-lg">
        ✍️ {isOwner ? 'Signature du propriétaire' : 'Signature du locataire'}
      </h3>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
        <p className="font-semibold">En signant vous confirmez :</p>
        <p>✅ Avoir lu et compris le contrat</p>
        <p>✅ Accepter les conditions de location</p>
        <p>✅ Vous engager à respecter vos obligations</p>
        {isRenter && <p>✅ Autoriser le prélèvement mensuel automatique via Stripe</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
          <input type="text" value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Jean Dupont"
            className="w-full border rounded-lg p-3" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
          <input type="date" value={form.birth_date}
            onChange={e => setForm(prev => ({ ...prev, birth_date: e.target.value }))}
            className="w-full border rounded-lg p-3" />
        </div>

      </div>

      <div className="flex items-start gap-3">
        <input type="checkbox" id="accept" checked={checked}
          onChange={e => setChecked(e.target.checked)}
          className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <label htmlFor="accept" className="text-sm text-gray-700 cursor-pointer">
          Je soussigné(e) <strong>{form.name || '...'}</strong>, déclare avoir lu et accepté
          les termes du présent contrat. Cette signature électronique a valeur juridique
          conformément à l'article 1366 du Code civil français.
        </label>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <p className="text-xs text-gray-400">
        Date et heure : {new Date().toLocaleString('fr-FR')}
      </p>

      {isRenter && (
        <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-700">
          <p className="font-semibold">💳 Après signature</p>
          <p>Vous serez redirigé vers Stripe pour configurer votre paiement mensuel de <strong>{spacePrice}€/mois</strong>.</p>
        </div>
      )}

      <button onClick={handleSign} disabled={loading || !checked || !form.name.trim()}
        className="w-full bg-blue-600 text-white rounded-lg p-4 font-bold hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Signature en cours...' : isRenter ? '✍️ Signer et payer' : '✍️ Signer le contrat'}
      </button>
    </div>
  )
}
