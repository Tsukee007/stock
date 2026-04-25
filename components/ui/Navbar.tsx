'use client'

import { usePathname } from 'next/navigation'

type Props = {
  user: { email: string; id: string } | null
}

export default function Navbar({ user }: Props) {
  const pathname = usePathname()

const links = [
  { href: '/', label: '🗺️', title: 'Carte' },
  { href: '/messages', label: '💬', title: 'Messages' },
  { href: '/dashboard', label: '📋', title: 'Dashboard' },
  { href: '/spaces/new', label: '➕', title: 'Déposer' },
]

const publicLinks = [
  { href: '/about', title: 'À propos' },
  { href: '/contact', title: 'Contact' },
]

  return (
    <>
      {/* Header desktop */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-blue-600">🗄️ Nestock</a>
        <nav className="hidden md:flex items-center gap-6">
  {[...links, ...publicLinks].map(link => (
            <a key={link.href} href={link.href}
              className={`text-sm font-medium transition ${
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}>
              {link.title}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden md:block text-sm text-gray-500">👤 {user.email}</span>
              <a href="/api/logout"
                className="text-sm text-gray-600 hover:text-red-500">
                Déconnexion
              </a>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm text-gray-600 hover:text-blue-600">Connexion</a>
              <a href="/register"
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                S'inscrire
              </a>
            </>
          )}
        </div>
      </header>

      {/* Menu mobile en bas */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex justify-around py-2">
          {links.map(link => (
            <a key={link.href} href={link.href}
              className={`flex flex-col items-center text-xs gap-1 px-3 py-1 rounded-lg transition ${
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}>
              <span className="text-xl">{link.label}</span>
              <span>{link.title}</span>
            </a>
          ))}
        </nav>
      )}
    </>
  )
}
