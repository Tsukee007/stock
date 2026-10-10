import { redirect } from 'next/navigation'

// Ancienne adresse : le calendrier est dans l'espace d'administration
export default function AdminCalendarRedirect() {
  redirect('/admin/calendrier')
}
