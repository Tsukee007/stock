'use client'

import { usePathname } from 'next/navigation'

const menu = [
  { href: '/admin/inscrits', title: 'Inscrits' },
  { href: '/admin/calendrier', title: 'Calendrier' },
  { href: '/admin/tests', title: 'Tests' },
]

// Menu de l'espace d'administration, la rubrique ouverte est mise en avant
export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex md:flex-col gap-2 overflow-x-auto">
      {menu.map(m => {
        const active = pathname.startsWith(m.href)
        return (
          <a key={m.href} href={m.href} aria-current={active ? 'page' : undefined}
            className={`text-sm px-3 py-2 rounded-lg whitespace-nowrap ${active
              ? 'bg-white text-blue-600 font-medium shadow-sm'
              : 'text-gray-600 hover:text-blue-600 hover:bg-white'}`}>
            {m.title}
          </a>
        )
      })}
    </nav>
  )
}
