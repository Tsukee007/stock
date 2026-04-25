import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditSpaceForm from '@/components/spaces/EditSpaceForm'

export default async function EditSpacePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: space } = await supabase
    .from('spaces')
    .select('*, space_photos(url, position)')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!space) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <a href="/dashboard" className="text-gray-500 hover:text-blue-600">← Dashboard</a>
          <h1 className="text-2xl font-bold">Modifier l'annonce</h1>
        </div>
        <EditSpaceForm space={space} />
      </div>
    </div>
  )
}