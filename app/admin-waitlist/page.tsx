import { redirect } from 'next/navigation'

// La liste d'attente est remplacee par la liste des comptes inscrits
export default function AdminWaitlist() {
  redirect('/admin/inscrits')
}
