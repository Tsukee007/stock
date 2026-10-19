// Éléments de preuve conservés en cas de contestation (signature, acceptation des CGU)

// Version des CGU en vigueur : à changer à chaque modification de app/cgu/page.tsx
export const CGU_VERSION = '2026-10-19'
export const CGU_DATE = '19 octobre 2026'

// Adresse IP et navigateur de la personne, vus par le serveur (Vercel renseigne x-forwarded-for)
export function clientInfo(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0].trim() || req.headers.get('x-real-ip') || null
  const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null
  return { ip, userAgent }
}
