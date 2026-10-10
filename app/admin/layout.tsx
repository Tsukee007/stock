import { requireAdmin } from '@/lib/admin'
import AdminNav from './AdminNav'

// Espace d'administration : reserve au compte administrateur connecte
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:flex md:gap-6">
        <aside className="md:w-48 md:shrink-0 mb-6 md:mb-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Administration</p>
          <AdminNav />
          <p className="hidden md:block text-xs text-gray-400 mt-6 truncate">{user.email}</p>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
