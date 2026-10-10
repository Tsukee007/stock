import { redirect } from 'next/navigation'

// Ancienne adresse : le suivi des tests est dans l'espace d'administration
export default function AdminTestsRedirect() {
  redirect('/admin/tests')
}
