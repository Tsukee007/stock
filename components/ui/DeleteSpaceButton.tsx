'use client'

import React from 'react'

type DeleteSpaceButtonProps = {
  spaceId: string
}

export default function DeleteSpaceButton({
  spaceId,
}: DeleteSpaceButtonProps) {

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Supprimer cette annonce ?'
    )

    if (!confirmed) return

    const res = await fetch(`/api/spaces/${spaceId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      window.location.reload()
    } else {
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-600 hover:underline"
    >
      Supprimer
    </button>
  )
}