import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/ui/Navbar'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nestock — Location d\'espaces de stockage',
  description: 'Trouvez ou proposez un espace de stockage près de chez vous',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="fr">
      <body className={geist.className}>
        <Navbar user={user ? { email: user.email ?? '', id: user.id } : null} />
        <div className="pb-16 md:pb-0">
          {children}
        </div>
      </body>
    </html>
  )
}
