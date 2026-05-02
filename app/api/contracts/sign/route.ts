import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { contractId, bookingId, signatureName, isOwner } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const now = new Date().toISOString()

  if (isOwner) {
    await supabase.from('contracts').update({
      owner_signed: true,
      owner_signed_at: now,
      owner_signature_name: signatureName,
      status: 'owner_signed'
    }).eq('id', contractId)

    // Notifier le locataire
    const { data: contract } = await supabase
      .from('contracts')
      .select('*, spaces(title)')
      .eq('id', contractId)
      .single()

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: renterAuth } = await adminClient.auth.admin.getUserById(contract.renter_id)
    const renterEmail = renterAuth?.user?.email
    const spaceTitle = (contract.spaces as any)?.title

    if (renterEmail) {
      await sendEmail({
        to: renterEmail,
        subject: 'Votre contrat Nestock est pret a signer',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nestock</h2>
            <p>Le proprietaire a signe le contrat pour <strong>${spaceTitle}</strong>.</p>
            <p>Il ne reste plus qu'a apposer votre signature pour finaliser la location !</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contracts/${bookingId}"
              style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
              Signer le contrat
            </a>
          </div>
        `
      })
    }

  } else {
    // Locataire signe
    await supabase.from('contracts').update({
      renter_signed: true,
      renter_signed_at: now,
      renter_signature_name: signatureName,
      status: 'fully_signed'
    }).eq('id', contractId)

    // Passer la réservation en confirmed
    await supabase.from('bookings').update({
      status: 'confirmed'
    }).eq('id', bookingId)

    // Message automatique
    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: user.id,
      content: 'Le contrat a ete signe par les deux parties. La location est officiellement confirmee !'
    })

    // Notifier le propriétaire
    const { data: contract } = await supabase
      .from('contracts')
      .select('*, spaces(title)')
      .eq('id', contractId)
      .single()

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: ownerAuth } = await adminClient.auth.admin.getUserById(contract.owner_id)
    const ownerEmail = ownerAuth?.user?.email
    const spaceTitle = (contract.spaces as any)?.title

    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: 'Contrat signe - Location confirmee !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nestock</h2>
            <p>Le contrat pour <strong>${spaceTitle}</strong> a ete signe par les deux parties.</p>
            <p>La location est maintenant officiellement confirmee !</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
              style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
              Voir le dashboard
            </a>
          </div>
        `
      })
    }
  }

  return NextResponse.json({ success: true })
}
