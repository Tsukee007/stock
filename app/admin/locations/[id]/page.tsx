import Stripe from 'stripe'
import { notFound } from 'next/navigation'
import { adminClient, frDate, requireAdmin, euros } from '@/lib/admin'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

// Dossier de preuves d'une location : tout ce qu'il faut pour répondre à une contestation de paiement.
// Imprimer la page (Cmd+P → Enregistrer en PDF) pour la joindre à la réponse dans Stripe.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 mb-6 break-inside-avoid">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-1.5 text-sm border-b border-gray-50 last:border-0">
      <div className="text-gray-500">{label}</div>
      <div className="col-span-2 text-gray-900 break-words">{value || <span className="text-gray-300">non enregistré</span>}</div>
    </div>
  )
}

const eur = (cents: number) => euros(cents / 100)

export default async function DossierLocation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAdmin()
  const db = adminClient()

  const { data: booking } = await db.from('bookings')
    .select('*, spaces(id, title, address, postal_code, city, owner_id, price_month, price_ttc)')
    .eq('id', id).single()
  if (!booking) notFound()
  const space = booking.spaces as any

  const [{ data: contract }, { data: messages }, { data: invoices }, { data: profiles }, ownerAuth, renterAuth] = await Promise.all([
    db.from('contracts').select('*').eq('booking_id', id).maybeSingle(),
    db.from('messages').select('sender_id, content, created_at').eq('booking_id', id).order('created_at'),
    db.from('invoices').select('amount, stripe_payment_id, status, created_at, reference').eq('booking_id', id).order('created_at'),
    db.from('profiles').select('id, full_name, phone, address, postal_code, city').in('id', [space.owner_id, booking.renter_id]),
    db.auth.admin.getUserById(space.owner_id),
    db.auth.admin.getUserById(booking.renter_id),
  ])
  const profileById = new Map((profiles ?? []).map(p => [p.id, p]))
  const owner = { ...profileById.get(space.owner_id), user: ownerAuth.data.user }
  const renter = { ...profileById.get(booking.renter_id), user: renterAuth.data.user }
  const nameOf = (uid: string) => uid === space.owner_id ? 'Propriétaire' : uid === booking.renter_id ? 'Locataire' : 'Autre'

  // Côté Stripe : factures de l'abonnement, remboursements, reversements au propriétaire, contestations
  let stripeData: {
    invoices: Stripe.Invoice[]
    refunds: Stripe.Refund[]
    transfers: Stripe.Transfer[]
    disputes: Stripe.Dispute[]
    error?: string
  } = { invoices: [], refunds: [], transfers: [], disputes: [] }
  try {
    const [invs, transfers] = await Promise.all([
      booking.stripe_subscription_id
        ? stripe.invoices.list({ subscription: booking.stripe_subscription_id, limit: 100 })
        : Promise.resolve({ data: [] as Stripe.Invoice[] }),
      stripe.transfers.list({ transfer_group: 'booking_' + id, limit: 100 }),
    ])
    const paymentIds = [...new Set((invoices ?? []).map(i => i.stripe_payment_id).filter(Boolean))] as string[]
    const perPayment = await Promise.all(paymentIds.map(pi => Promise.all([
      stripe.refunds.list({ payment_intent: pi, limit: 100 }),
      stripe.disputes.list({ payment_intent: pi, limit: 100 }),
    ])))
    stripeData = {
      invoices: invs.data,
      transfers: transfers.data,
      refunds: perPayment.flatMap(([r]) => r.data),
      disputes: perPayment.flatMap(([, d]) => d.data),
    }
  } catch (err: any) {
    stripeData.error = err?.message || String(err)
  }
  const ts = (s: number) => frDate(new Date(s * 1000).toISOString(), true)

  const person = (p: any) => (
    <>
      <Row label="Nom" value={p.full_name} />
      <Row label="E-mail" value={p.user?.email} />
      <Row label="Téléphone" value={p.phone} />
      <Row label="Adresse" value={[p.address, p.postal_code, p.city].filter(Boolean).join(' ')} />
      <Row label="Compte créé le" value={frDate(p.user?.created_at, true)} />
      <Row label="CGU acceptées à l'inscription" value={p.user?.app_metadata?.cgu
        ? `version ${p.user.app_metadata.cgu.version}, le ${frDate(p.user.app_metadata.cgu.accepted_at, true)}, IP ${p.user.app_metadata.cgu.ip ?? '?'}`
        : null} />
    </>
  )

  const signature = (role: 'owner' | 'renter') => contract && (
    <>
      <Row label="Signé" value={contract[`${role}_signed`] ? `oui, le ${frDate(contract[`${role}_signed_at`], true)}` : 'non'} />
      <Row label="Nom saisi" value={contract[`${role}_signature_name`]} />
      <Row label="Date de naissance" value={frDate(contract[`${role}_birth_date`])} />
      <Row label="Adresse IP" value={contract[`${role}_ip`]} />
      <Row label="Navigateur" value={contract[`${role}_user_agent`]} />
      <Row label="Version des CGU acceptée" value={contract[`${role}_cgu_version`]} />
    </>
  )

  return (
    <div>
      <a href="/admin/locations" className="text-sm text-gray-500 hover:text-blue-600 print:hidden">← Locations</a>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-1">Dossier de preuves</h1>
      <p className="text-sm text-gray-500 mb-6">
        {space.title} — location {id}. Pour joindre ce dossier à une réponse de contestation : Cmd+P → Enregistrer en PDF.
      </p>

      <Section title="Location">
        <Row label="Espace" value={`${space.title}, ${[space.address, space.postal_code, space.city].filter(Boolean).join(' ')}`} />
        <Row label="Statut" value={booking.status} />
        <Row label="Demande faite le" value={frDate(booking.created_at, true)} />
        <Row label="Début" value={frDate(booking.start_date)} />
        <Row label="Loyer propriétaire (figé)" value={euros(booking.price_month)} />
        <Row label="Prix payé par le locataire" value={euros(contract?.loyer_ttc ?? space.price_ttc)} />
        <Row label="Abonnement Stripe" value={booking.stripe_subscription_id} />
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Propriétaire">{person(owner)}</Section>
        <Section title="Locataire">{person(renter)}</Section>
      </div>

      <Section title={`Contrat${contract?.reference ? ' ' + contract.reference : ''}`}>
        {contract ? (
          <>
            <Row label="Statut" value={contract.status} />
            <Row label="Date de début" value={frDate(contract.date_debut)} />
            <Row label="Loyer HT / TTC" value={`${euros(contract.loyer_ht)} / ${euros(contract.loyer_ttc)}`} />
            <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-1">Signature du propriétaire</h3>
            {signature('owner')}
            <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-1">Signature du locataire</h3>
            {signature('renter')}
            <p className="text-sm mt-4"><a href={`/contracts/${id}`} className="text-blue-600 hover:underline print:hidden">Voir le contrat complet →</a></p>
          </>
        ) : <p className="text-sm text-gray-400">Aucun contrat.</p>}
      </Section>

      <Section title="Paiements">
        {stripeData.error && <p className="text-sm text-red-600 mb-3">Stripe illisible : {stripeData.error}</p>}
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 uppercase"><th className="text-left py-1">Date</th><th className="text-left">Facture Stripe</th><th className="text-left">Montant</th><th className="text-left">Statut</th></tr></thead>
          <tbody className="divide-y divide-gray-50">
            {stripeData.invoices.slice().reverse().map(inv => (
              <tr key={inv.id}><td className="py-1.5">{ts(inv.created)}</td><td className="text-gray-500">{inv.number ?? inv.id}</td><td>{eur(inv.amount_paid)}</td><td>{inv.status}</td></tr>
            ))}
          </tbody>
        </table>
        {!stripeData.invoices.length && <p className="text-sm text-gray-400">Aucune facture Stripe.</p>}
        <p className="text-xs text-gray-400 mt-3">Factures enregistrées par Nestock : {(invoices ?? []).map(i => `${i.reference ?? ''} ${euros(i.amount)} le ${frDate(i.created_at)}`).join(' ; ') || 'aucune'}</p>
      </Section>

      <Section title="Reversements au propriétaire, remboursements et contestations">
        {stripeData.transfers.map(t => (
          <Row key={t.id} label={`Reversement ${ts(t.created)}`} value={`${eur(t.amount)}${t.amount_reversed ? `, dont ${eur(t.amount_reversed)} repris` : ''} (${t.id})`} />
        ))}
        {stripeData.refunds.map(r => (
          <Row key={r.id} label={`Remboursement ${ts(r.created)}`} value={`${eur(r.amount)} — ${r.status} (${r.id})`} />
        ))}
        {stripeData.disputes.map(d => (
          <Row key={d.id} label={`Contestation ${ts(d.created)}`} value={<span className="text-red-600">{`${eur(d.amount)} — ${d.reason} — ${d.status} (${d.id})`}</span>} />
        ))}
        {!stripeData.transfers.length && !stripeData.refunds.length && !stripeData.disputes.length && <p className="text-sm text-gray-400">Rien à signaler.</p>}
      </Section>

      <Section title="Résiliation">
        <Row label="Demandée par" value={booking.notice_initiated_by === 'renter' ? 'le locataire' : booking.notice_initiated_by === 'owner' ? 'le propriétaire' : null} />
        <Row label="Demandée le" value={frDate(booking.notice_initiated_at, true)} />
        <Row label="Fin de la location" value={frDate(booking.ending_date, true)} />
        <Row label="Accusé de réception" value={frDate(booking.notice_acknowledged_at, true)} />
      </Section>

      <Section title={`Messages (${messages?.length ?? 0})`}>
        <div className="space-y-2">
          {(messages ?? []).map((m, i) => (
            <div key={i} className="text-sm">
              <span className="text-gray-400">{frDate(m.created_at, true)} — {nameOf(m.sender_id)} :</span>{' '}
              <span className="text-gray-800 whitespace-pre-wrap">{m.content}</span>
            </div>
          ))}
          {!messages?.length && <p className="text-sm text-gray-400">Aucun message.</p>}
        </div>
      </Section>
    </div>
  )
}
