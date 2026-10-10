import { redirect } from 'next/navigation'

// Ancienne adresse : la liste des inscrits est dans l'espace d'administration
export default function AdminInscritsRedirect() {
  redirect('/admin/inscrits')
}
