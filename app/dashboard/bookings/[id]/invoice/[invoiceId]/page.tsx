import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function InvoicePage({
  params
}: {
  params: Promise<{ id: string, invoiceId: string }>
}) {
  const { id, invoiceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (!invoice) notFound()

  if (invoice.owner_id !== user.id && invoice.renter_id !== user.id) redirect('/dashboard')

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, spaces(title, address, city, surface_m2, type, price_month, owner_id)')
    .eq('id', invoice.booking_id)
    .single()

  const space = booking?.spaces as any

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name, address, city, postal_code, phone')
    .eq('id', invoice.owner_id)
    .single()

  const { data: renterProfile } = await supabase
    .from('profiles')
    .select('full_name, address, city, postal_code, phone')
    .eq('id', invoice.renter_id)
    .single()

  const ownerAddress = ownerProfile ? [ownerProfile.address, ownerProfile.postal_code, ownerProfile.city].filter(Boolean).join(', ') : '—'
  const renterAddress = renterProfile ? [renterProfile.address, renterProfile.postal_code, renterProfile.city].filter(Boolean).join(', ') : '—'
  const periode = new Date(invoice.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const dateStr = new Date(invoice.created_at).toLocaleDateString('fr-FR')

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">

        <div className="flex items-center justify-between">
          <a href={'/dashboard/bookings/' + id} className="text-gray-500 hover:text-blue-600 text-sm">
            ← Retour
          </a>
          <button onClick={() => window.print()}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            🖨️ Imprimer
          </button>
        </div>

        {/* Quittance */}
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 print:shadow-none print:rounded-none">

          {/* En-tête */}
          <div className="text-center border-b-2 border-blue-600 pb-6">
            <h1 className="text-2xl font-bold text-blue-600">NESTOCK</h1>
            <p className="text-gray-500 text-xs">nestock.tsukee.fr</p>
            <h2 className="text-xl font-bold mt-4 text-gray-800">QUITTANCE DE LOYER</h2>
            <p className="text-gray-500 text-sm mt-1">Ref. {invoice.reference}</p>
            <p className="text-gray-500 text-sm">Date : {dateStr}</p>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <p className="font-bold text-blue-700 mb-2">LE BAILLEUR</p>
              <p className="font-semibold text-sm">{ownerProfile?.full_name ?? '—'}</p>
              <p className="text-gray-600 text-xs">{ownerAddress}</p>
              <p className="text-gray-600 text-xs">{ownerProfile?.phone ?? '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <p className="font-bold text-blue-700 mb-2">LE LOCATAIRE</p>
              <p className="font-semibold text-sm">{renterProfile?.full_name ?? '—'}</p>
              <p className="text-gray-600 text-xs">{renterAddress}</p>
              <p className="text-gray-600 text-xs">{renterProfile?.phone ?? '—'}</p>
            </div>
          </div>

          {/* Détails location */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="font-bold text-gray-800 mb-3">DÉTAILS DE LA LOCATION</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Description</p>
                <p className="font-semibold">Location espace de stockage — {space?.title}</p>
              </div>
              <div>
                <p className="text-gray-500">Adresse du lieu</p>
                <p className="font-semibold">{space?.address}, {space?.city}</p>
              </div>
              <div>
                <p className="text-gray-500">Période</p>
                <p className="font-semibold">{periode}</p>
              </div>
              <div>
                <p className="text-gray-500">Moyen de paiement</p>
                <p className="font-semibold">Prélèvement automatique Stripe</p>
              </div>
              <div>
                <p className="text-gray-500">Date de paiement</p>
                <p className="font-semibold">{dateStr}</p>
              </div>
            </div>
          </div>

          {/* Montant */}
          <div className="bg-blue-600 rounded-xl p-6 text-center text-white">
            <p className="text-sm opacity-90">MONTANT PAYÉ</p>
            <p className="text-4xl font-bold mt-1">{invoice.amount.toFixed(2)} €</p>
            <span className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full mt-2 inline-block font-semibold">
              ✅ Payée
            </span>
          </div>

          {/* Pied de page */}
          <div className="border-t pt-4 text-center text-xs text-gray-400 space-y-1">
            <p>Quittance générée automatiquement par la plateforme Nestock</p>
            <p>Ce document atteste du paiement effectué et vaut quittance de loyer.</p>
            <p>nestock.tsukee.fr — contact@tsukee.fr</p>
          </div>

        </div>
      </div>
    </div>
  )
}
