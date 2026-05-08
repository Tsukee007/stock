'use client'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()}
      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
      🖨️ Imprimer
    </button>
  )
}
