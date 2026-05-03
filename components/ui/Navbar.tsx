'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import NotificationBell from '@/components/ui/NotificationBell'

type Props = {
  user: { email: string; id: string } | null
}

export default function Navbar({ user }: Props) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/', title: 'Carte' },
    { href: '/messages', title: 'Messages' },
    { href: '/dashboard', title: 'Dashboard' },
    { href: '/spaces/new', title: 'Déposer' },
    { href: '/about', title: 'À propos' },
    { href: '/contact', title: 'Contact' },
  ]

  const mobileLinks = [
    { href: '/', label: '🗺️', title: 'Carte' },
    { href: '/messages', label: '💬', title: 'Messages' },
    { href: '/dashboard', label: '📋', title: 'Dashboard' },
    { href: '/spaces/new', label: '➕', title: 'Déposer' },
  ]

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <a href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
            🗄️ Nestock
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map(link => (
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

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
<NotificationBell userId={user.id} />
<span className="text-sm text-gray-500 truncate max-w-40">👤 {user.email}</span>
<a href="/api/logout" className="text-sm text-gray-400 hover:text-red-500">
  Déconnexion
</a>
              </>
            ) : (
              <>
                <a href="/login" className="text-sm text-gray-600 hover:text-blue-600">Connexion</a>
                <a href="/register" className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                  S'inscrire
                </a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-600 hover:text-blue-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu déroulant */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-3 space-y-3">
              {links.map(link => (
                <a key={link.href} href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block text-sm font-medium py-2 border-b border-gray-100 ${
                    pathname === link.href ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                  {link.title}
                </a>
              ))}
              {user ? (
                <div className="pt-2 space-y-2">
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <a href="/api/logout" className="block text-sm text-red-500 py-2">
                    Déconnexion
                  </a>
                </div>
              ) : (
                <div className="pt-2 flex gap-3">
                  <a href="/login" className="flex-1 text-center text-sm border border-blue-600 text-blue-600 py-2 rounded-lg">
                    Connexion
                  </a>
                  <a href="/register" className="flex-1 text-center text-sm bg-blue-600 text-white py-2 rounded-lg">
                    S'inscrire
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Menu mobile fixe en bas */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around py-2">
          {mobileLinks.map(link => (
            <a key={link.href} href={link.href}
              className={`flex flex-col items-center text-xs gap-1 px-3 py-1 rounded-lg transition ${
                pathname === link.href ? 'text-blue-600' : 'text-gray-400'
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