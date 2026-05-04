'use client'

import { useState } from 'react'

export default function DeleteSpaceButton({ spaceId }: { spaceId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch('/api/spaces/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spaceId })
    })
    const data = await res.json()
    if (data.error) {
      alert(data.error)
      setLoading(false)
      setConfirm(false)
      return
    }
    window.location.reload()
  }

  if (confirm) return (
    <div className="flex gap-2 items-center">
      <span className="text-xs text-red-600">Confirmer ?</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? '...' : 'Oui'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-300"
      >
        Non
      </button>
    </div>
  )

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-red-500 hover:text-red-700 hover:underline"
    >
      Supprimer
    </button>
  )
}
