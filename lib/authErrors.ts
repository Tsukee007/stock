// Messages d'erreur Supabase Auth traduits en français (T-AUTH-02 : les messages
// bruts s'affichaient en anglais, ex. « Invalid login credentials »).

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail ou mot de passe incorrect.',
  email_not_confirmed: 'Votre adresse e-mail n’est pas encore confirmée : cliquez sur le lien reçu par e-mail.',
  user_already_exists: 'Un compte existe déjà avec cette adresse e-mail.',
  email_exists: 'Un compte existe déjà avec cette adresse e-mail.',
  weak_password: 'Mot de passe trop faible : choisissez-en un plus long ou plus varié.',
  validation_failed: 'Veuillez saisir une adresse e-mail et un mot de passe valides.',
  email_address_invalid: 'Cette adresse e-mail n’est pas valide.',
  over_request_rate_limit: 'Trop de tentatives : réessayez dans quelques minutes.',
  over_email_send_rate_limit: 'Trop d’e-mails envoyés : réessayez dans quelques minutes.',
}

export function authErrorMessage(error: { code?: string; message: string }): string {
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]
  const message = error.message.toLowerCase()
  if (message.includes('invalid login credentials')) return MESSAGES.invalid_credentials
  if (message.includes('email not confirmed')) return MESSAGES.email_not_confirmed
  if (message.includes('already registered')) return MESSAGES.user_already_exists
  if (message.includes('missing email or phone') || message.includes('missing password')) return 'Veuillez saisir votre e-mail et votre mot de passe.'
  return 'Une erreur est survenue. Réessayez, ou contactez-nous à contact@nestock.pro.'
}
