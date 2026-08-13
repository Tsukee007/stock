import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/waitlist',
  '/admin-waitlist',
  '/admin-calendar',
  '/api/waitlist',
  '/api/admin-waitlist',
  '/api/admin-calendar',
  '/api/stripe/webhook',
  '/_next',
  '/favicon.ico',
]

// Waitlist desactivee : inscription directe ouverte.
// Repasser a true pour reactiver le blocage pre-lancement si besoin.
const WAITLIST_ACTIVE = false

export function proxy(request: NextRequest) {
  if (!WAITLIST_ACTIVE) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  if (!isPublic) {
    return NextResponse.redirect(new URL('/waitlist', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}