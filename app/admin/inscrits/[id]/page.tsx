import { notFound } from 'next/navigation'
import { adminClient, euros, frDate, requireAdmin } from '@/lib/admin'
import { statusColors, statusLabels } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const contractLabels: Record<string, string> = {
  pending: 'En attente de signature',
  owner_signed: 'Signe par le proprietaire',
  fully_signed: 'Signe par les deux parties',
}

type Event = { date: string; label: string; href?: string }

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-900 mb-4">
        {title}{count !== undefined && <span className="ml-2 text-sm font-normal text-gray-400">({count})</span>}
      </h2>
      {children}
    </section>
  )
}

const Empty = ({ text }: { text: string }) => <p className="text-sm text-gray-400">{text}</p>

function Status({ status }: { status: string | null }) {
  const s = status ?? ''
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[s] ?? 'bg-gray-100 text-gray-500'}`}>{statusLabels[s] ?? s}</span>
}

export default async function FicheInscrit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const db = adminClient()

  const { data: authData } = await db.auth.admin.getUserById(id)
  const user = authData?.user
  if (!user) notFound()

  const [{ data: profile }, { data: spaces }, { data: rentals }] = await Promise.all([
    db.from('profiles').select('*').eq('id', id).maybeSingle(),
    db.from('spaces').select('*, space_photos(url, position)').eq('owner_id', id).order('created_at', { ascending: false }),
    db.from('bookings').select('*, spaces(id, title, city, owner_id)').eq('renter_id', id).order('created_at', { ascending: false }),
  ])

  const spaceIds = (spaces ?? []).map(s => s.id)
  const bookingIdsAsRenter = (rentals ?? []).map(b => b.id)

  const [{ data: received }, { data: contracts }, { data: invoices }, { data: reviews }, { data: sentMessages }] = await Promise.all([
    spaceIds.length
      ? db.from('bookings').select('*, spaces(id, title, city)').in('space_id', spaceIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    db.from('contracts').select('*').or(`owner_id.eq.${id},renter_id.eq.${id}`).order('created_at', { ascending: false }),
    db.from('invoices').select('*').or(`owner_id.eq.${id},renter_id.eq.${id}`).order('created_at', { ascending: false }),
    db.from('reviews').select('*').or(`author_id.eq.${id},target_id.eq.${id}`).order('created_at', { ascending: false }),
    // Messages : jamais le contenu (decision du 10/10/2026), seulement la date et la reservation concernee
    db.from('messages').select('booking_id, created_at').eq('sender_id', id).order('created_at', { ascending: false }),
  ])

  // Messages recus = messages des autres dans les conversations de ses reservations (locataire ou proprietaire)
  const allBookingIds = [...bookingIdsAsRenter, ...(received ?? []).map(b => b.id)]
  const { data: receivedMessages } = allBookingIds.length
    ? await db.from('messages').select('created_at').in('booking_id', allBookingIds).neq('sender_id', id)
    : { data: [] as { created_at: string }[] }

  // Noms des autres personnes citees sur la fiche
  const otherIds = new Set<string>()
  for (const b of rentals ?? []) if (b.spaces?.owner_id) otherIds.add(b.spaces.owner_id)
  for (const b of received ?? []) if (b.renter_id) otherIds.add(b.renter_id)
  for (const r of reviews ?? []) for (const x of [r.author_id, r.target_id]) if (x && x !== id) otherIds.add(x)
  const { data: others } = otherIds.size
    ? await db.from('profiles').select('id, full_name').in('id', [...otherIds])
    : { data: [] as { id: string; full_name: string | null }[] }
  const nameOf = (uid: string | null | undefined) =>
    others?.find(o => o.id === uid)?.full_name || 'non renseigne'
  const PersonLink = ({ uid }: { uid: string | null | undefined }) =>
    uid ? <a href={`/admin/inscrits/${uid}`} className="text-blue-600 hover:underline">{nameOf(uid)}</a> : <span>?</span>

  // Historique : tout ce que la personne a fait sur le site, du plus recent au plus ancien
  const events: Event[] = [{ date: user.created_at, label: 'Inscription' }]
  if (user.email_confirmed_at) events.push({ date: user.email_confirmed_at, label: 'Adresse e-mail confirmee' })
  if (user.last_sign_in_at) events.push({ date: user.last_sign_in_at, label: 'Derniere connexion' })
  for (const s of spaces ?? []) events.push({ date: s.created_at, label: `Annonce publiee : ${s.title}`, href: `/spaces/${s.id}` })
  for (const b of rentals ?? []) events.push({ date: b.created_at, label: `Demande de reservation : ${b.spaces?.title ?? 'espace supprime'} (${statusLabels[b.status] ?? b.status})` })
  for (const b of received ?? []) events.push({ date: b.created_at, label: `Demande recue de ${nameOf(b.renter_id)} pour ${b.spaces?.title}` })
  for (const c of contracts ?? []) {
    const signedAt = c.owner_id === id ? c.owner_signed_at : c.renter_signed_at
    if (signedAt) events.push({ date: signedAt, label: `Contrat signe ${c.reference ?? ''}` })
  }
  for (const i of invoices ?? []) events.push({ date: i.created_at, label: `Facture ${i.reference ?? ''} : ${euros(i.amount)} (${i.renter_id === id ? 'payee' : 'encaissee'})` })
  for (const r of reviews ?? []) events.push({ date: r.created_at, label: r.author_id === id ? `Avis donne (${r.rating}/5)` : `Avis recu (${r.rating}/5)` })
  // Messages regroupes par jour pour ne pas noyer l'historique
  const msgByDay = new Map<string, { date: string; n: number }>()
  for (const m of sentMessages ?? []) {
    const day = frDate(m.created_at)
    const e = msgByDay.get(day)
    if (e) e.n++
    else msgByDay.set(day, { date: m.created_at, n: 1 })
  }
  for (const { date, n } of msgByDay.values()) events.push({ date, label: `${n} message${n > 1 ? 's' : ''} envoye${n > 1 ? 's' : ''}` })
  events.sort((a, b) => b.date.localeCompare(a.date))

  const lastMessage = sentMessages?.[0]?.created_at

  const identity = [
    ['Email', user.email],
    ['Telephone', profile?.phone],
    ['Adresse', [profile?.address, profile?.postal_code, profile?.city].filter(Boolean).join(', ')],
    ['Inscrit le', frDate(user.created_at, true)],
    ['Email confirme', user.email_confirmed_at ? `oui, le ${frDate(user.email_confirmed_at, true)}` : 'non, en attente'],
    ['Derniere connexion', frDate(user.last_sign_in_at, true) || 'jamais'],
    ['Paiements Stripe', profile?.stripe_onboarding_complete ? 'compte proprietaire actif' : profile?.stripe_account_id ? 'compte proprietaire en cours de creation' : profile?.stripe_customer_id ? 'client (carte enregistree)' : 'aucun'],
    ['Note moyenne', profile?.rating_count ? `${profile.rating_avg}/5 (${profile.rating_count} avis)` : 'aucun avis'],
  ]

  return (
    <div>
      <a href="/admin/inscrits" className="text-sm text-gray-500 hover:text-blue-600">← Tous les inscrits</a>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">
        {profile?.full_name || 'Nom non renseigne'}
        {user.app_metadata?.role === 'admin' && <span className="ml-3 align-middle text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">admin</span>}
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ['Annonces', spaces?.length ?? 0],
          ['Demandes faites', rentals?.length ?? 0],
          ['Demandes recues', received?.length ?? 0],
          ['Messages envoyes / recus', `${sentMessages?.length ?? 0} / ${receivedMessages?.length ?? 0}`],
        ].map(([label, value]) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <Section title="Qui est-ce">
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {identity.map(([k, v]) => (
            <div key={k}>
              <dt className="text-gray-400">{k}</dt>
              <dd className="text-gray-900">{v || <span className="text-gray-400">non renseigne</span>}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Annonces deposees" count={spaces?.length ?? 0}>
        {!spaces?.length ? <Empty text="Aucune annonce." /> : (
          <div className="space-y-4">
            {spaces.map(s => {
              const photo = [...(s.space_photos ?? [])].sort((a: any, b: any) => a.position - b.position)[0]
              return (
                <div key={s.id} className="flex gap-4 border border-gray-100 rounded-xl p-3">
                  {photo
                    ? <img src={photo.url} alt="" className="w-24 h-20 object-cover rounded-lg shrink-0" />
                    : <div className="w-24 h-20 bg-gray-100 rounded-lg shrink-0" />}
                  <div className="text-sm min-w-0">
                    <a href={`/spaces/${s.id}`} className="font-medium text-blue-600 hover:underline">{s.title}</a>
                    <p className="text-gray-500">{s.type} · {s.surface_m2 ? `${s.surface_m2} m² · ` : ''}{s.address}, {s.postal_code} {s.city}</p>
                    <p className="text-gray-500">{euros(s.price_month)} / mois · publiee le {frDate(s.created_at)} · {s.space_photos?.length ?? 0} photo(s)</p>
                    <p className={s.is_active ? 'text-green-600' : 'text-gray-400'}>{s.is_active ? 'En ligne' : 'Desactivee'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Demandes de reservation faites (locataire)" count={rentals?.length ?? 0}>
        {!rentals?.length ? <Empty text="Aucune demande." /> : (
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 text-left"><th className="pb-2">Espace</th><th className="pb-2">Proprietaire</th><th className="pb-2">Debut</th><th className="pb-2">Loyer</th><th className="pb-2">Statut</th><th className="pb-2">Demande le</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {rentals.map(b => (
                <tr key={b.id}>
                  <td className="py-2">{b.spaces ? <a href={`/spaces/${b.spaces.id}`} className="text-blue-600 hover:underline">{b.spaces.title}</a> : 'espace supprime'}</td>
                  <td className="py-2"><PersonLink uid={b.spaces?.owner_id} /></td>
                  <td className="py-2">{frDate(b.start_date)}</td>
                  <td className="py-2">{euros(b.price_month)}</td>
                  <td className="py-2"><Status status={b.status} /></td>
                  <td className="py-2 text-gray-400">{frDate(b.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="Demandes recues sur ses annonces (proprietaire)" count={received?.length ?? 0}>
        {!received?.length ? <Empty text="Aucune demande recue." /> : (
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 text-left"><th className="pb-2">Espace</th><th className="pb-2">Locataire</th><th className="pb-2">Debut</th><th className="pb-2">Loyer</th><th className="pb-2">Statut</th><th className="pb-2">Recue le</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {received.map((b: any) => (
                <tr key={b.id}>
                  <td className="py-2">{b.spaces?.title}</td>
                  <td className="py-2"><PersonLink uid={b.renter_id} /></td>
                  <td className="py-2">{frDate(b.start_date)}</td>
                  <td className="py-2">{euros(b.price_month)}</td>
                  <td className="py-2"><Status status={b.status} /></td>
                  <td className="py-2 text-gray-400">{frDate(b.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="Contrats et factures" count={(contracts?.length ?? 0) + (invoices?.length ?? 0)}>
        {!contracts?.length && !invoices?.length ? <Empty text="Aucun contrat ni facture." /> : (
          <ul className="text-sm space-y-2">
            {contracts?.map(c => (
              <li key={c.id}>Contrat {c.reference} ({c.owner_id === id ? 'proprietaire' : 'locataire'}) — {euros(c.loyer_ttc)} TTC / mois, debut {frDate(c.date_debut)} — {contractLabels[c.status] ?? c.status}</li>
            ))}
            {invoices?.map(i => (
              <li key={i.id}>Facture {i.reference} — {euros(i.amount)} — {i.renter_id === id ? 'payee' : 'encaissee'} le {frDate(i.created_at)}</li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Avis" count={reviews?.length ?? 0}>
        {!reviews?.length ? <Empty text="Aucun avis." /> : (
          <ul className="text-sm space-y-3">
            {reviews.map(r => (
              <li key={r.id}>
                <span className="font-medium">{r.rating}/5</span>{' '}
                {r.author_id === id ? <>donne a <PersonLink uid={r.target_id} /></> : <>recu de <PersonLink uid={r.author_id} /></>}
                {' '}le {frDate(r.created_at)}
                {r.comment && <p className="text-gray-500 mt-1">« {r.comment} »</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Messages">
        <p className="text-sm text-gray-600">
          {sentMessages?.length ?? 0} message(s) envoye(s), {receivedMessages?.length ?? 0} recu(s)
          {lastMessage && <> — dernier envoi le {frDate(lastMessage, true)}</>}.
        </p>
        <p className="text-xs text-gray-400 mt-2">Le contenu des conversations n'est pas affiche (vie privee des utilisateurs).</p>
      </Section>

      <Section title="Historique" count={events.length}>
        <ol className="border-l border-gray-200 ml-2 space-y-3">
          {events.map((e, i) => (
            <li key={i} className="ml-4 text-sm">
              <span className="text-gray-400 mr-2">{frDate(e.date, true)}</span>
              {e.href ? <a href={e.href} className="text-blue-600 hover:underline">{e.label}</a> : e.label}
            </li>
          ))}
        </ol>
      </Section>
    </div>
  )
}
