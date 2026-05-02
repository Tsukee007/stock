'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  contract: any
  isOwner: boolean
  isRenter: boolean
  bookingId: string
}

export default function ContractSign({ contract, isOwner, isRenter, bookingId }: Props) {
  const [name, setName] = useState('')
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const canOwnerSign = isOwner && !contract.owner_signed
  const canRenterSign = isRenter && contract.owner_signed && !contract.renter_signed
  const alreadySigned = (isOwner && contract.owner_signed) || (isRenter && contract.renter_signed)
  const fullySigned = contract.status === 'fully_signed'

  const handleSign = async () => {
    if (!checked) {
      setError('Veuillez cocher la case pour confirmer votre accord')
      return
    }
    if (!name.trim()) {
      setError('Veuillez entrer votre nom complet')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/contracts/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractId: contract.id,
        bookingId,
        signatureName: name.trim(),
        isOwner,
      })
    })

    const data = await res.json()
    if (data.error) {
      setError(data.error)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  if (fullySigned) {
    return (
      <div className="bg-green-50 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-green-700 text-lg">✅ Contrat entièrement signé</h3>
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
        <a href={'/dashboard'} className="block text-center text-sm text-blue-600 hover:underline">
          Retour au dashboard →
        </a>
      </div>
    )
  }

  if (alreadySigned) {
    return (
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-bold text-blue-700">✅ Vous avez déjà signé ce contrat</h3>
        {isOwner && !contract.renter_signed && (
          <p className="text-sm text-gray-600 mt-2">
            En attente de la signature du locataire. Un email lui a été envoyé.
          </p>
        )}
        {isRenter && !contract.owner_signed && (
          <p className="text-sm text-gray-600 mt-2">
            En attente de la signature du propriétaire.
          </p>
        )}
      </div>
    )
  }

  if (isRenter && !contract.owner_signed) {
    return (
      <div className="bg-yellow-50 rounded-xl p-6">
        <h3 className="font-bold text-yellow-700">⏳ En attente de la signature du propriétaire</h3>
        <p className="text-sm text-gray-600 mt-2">
          Le propriétaire doit signer le contrat en premier. Vous recevrez un email dès que ce sera fait.
        </p>
      </div>
    )
  }

  if (!canOwnerSign && !canRenterSign) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h3 className="font-bold text-lg">
        ✍️ {isOwner ? 'Signature du propriétaire' : 'Signature du locataire'}
      </h3>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
        <p className="font-semibold">En signant ce contrat, vous confirmez :</p>
        <p>✅ Avoir lu et compris l'intégralité du contrat ci-dessus</p>
        <p>✅ Accepter les conditions de location et de paiement</p>
        <p>✅ Vous engager à respecter vos obligations contractuelles</p>
        {isOwner && <p>✅ Confirmer que les informations sur votre espace sont exactes</p>}
        {isRenter && <p>✅ Ne stocker que des biens licites et non dangereux</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Votre nom complet (tel qu'il apparaîtra sur le contrat)
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Jean Dupont"
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="accept"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          className="w-5 h-5 mt-0.5 flex-shrink-0"
        />
        <label htmlFor="accept" className="text-sm text-gray-700 cursor-pointer">
          Je soussigné(e) <strong>{name || '...'}</strong>, déclare avoir lu et accepté 
          les termes du présent contrat de location. Cette signature électronique a valeur 
          juridique conformément à l'article 1366 du Code civil français.
        </label>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <div className="text-xs text-gray-400">
        <p>Date et heure de signature : {new Date().toLocaleString('fr-FR')}</p>
      </div>

      <button
        onClick={handleSign}
        disabled={loading || !checked || !name.trim()}
        className="w-full bg-blue-600 text-white rounded-lg p-4 font-bold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signature en cours...' : '✍️ Signer le contrat'}
      </button>
    </div>
  )
}