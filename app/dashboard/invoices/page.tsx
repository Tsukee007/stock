import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, spaces:bookings(spaces(title, city))')
    .or('owner_id.eq.' + user.id + ',renter_id.eq.' + user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-500 hover:text-blue-600">← Dashboard</a>
          <h1 className="text-xl font-bold">🧾 Mes factures</h1>
        </div>

        {(!invoices || invoices.length === 0) && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
            <p className="text-4xl mb-3">🧾</p>
            <p>Aucune facture pour le moment</p>
          </div>
        )}

        <div className="space-y-3">
          {invoices?.map(invoice => (
            <div key={invoice.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-blue-600">{invoice.reference}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(invoice.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  {invoice.owner_id === user.id && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Revenu proprietaire
                    </span>
                  )}
                  {invoice.renter_id === user.id && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Paiement locataire
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-800">{invoice.amount.toFixed(2)}€</p>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                    Payee
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
