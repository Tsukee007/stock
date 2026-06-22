import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/waitlist',
  '/api/waitlist',
  '/_next',
  '/favicon.ico',
]

export function middleware(request: NextRequest) {
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
