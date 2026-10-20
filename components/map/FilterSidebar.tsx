'use client'

import FilterFields from './FilterFields'

// Panneau de filtres toujours ouvert, à gauche de la liste (grand écran uniquement)
export default function FilterSidebar() {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r overflow-y-auto">
      <div className="p-4 border-b bg-gray-50">
        <p className="font-semibold text-gray-700">Filtres</p>
      </div>
      <div className="p-4">
        <FilterFields />
      </div>
    </aside>
  )
}
