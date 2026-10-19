// Calendrier de facturation Nestock (heure de Paris) :
// - le loyer est prélevé le 1er de chaque mois ; le premier paiement couvre les jours restants du mois en cours ;
// - une location se termine toujours le dernier jour d'un mois : préavis donné jusqu'au 15 inclus → fin du mois en cours,
//   après le 15 → fin du mois suivant. Le dernier mois payé est donc toujours entièrement dû : aucun remboursement.

const TZ = 'Europe/Paris'

// Écart entre l'heure de Paris et UTC à un instant donné (1 h l'hiver, 2 h l'été)
function parisOffsetMs(at: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at)
  const get = (type: string) => Number(parts.find(p => p.type === type)!.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return asUtc - Math.floor(at.getTime() / 1000) * 1000
}

// Minuit (heure de Paris) le jour donné ; month de 0 à 11, les débordements passent au mois suivant
function parisMidnight(year: number, month: number, day: number) {
  const guess = Date.UTC(year, month, day)
  return new Date(guess - parisOffsetMs(new Date(guess)))
}

function parisDay(now: Date) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(now).split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

// 1er du mois suivant à minuit, heure de Paris : date du prochain prélèvement (ancre de l'abonnement)
export function nextBillingDate(now = new Date()) {
  const { year, month } = parisDay(now)
  return parisMidnight(year, month + 1, 1)
}

// Fin de location pour un préavis donné maintenant
export function noticeEnd(now = new Date()) {
  const { year, month, day } = parisDay(now)
  const monthsAhead = day <= 15 ? 1 : 2
  // L'abonnement s'arrête le 1er du mois qui suit la fin, à minuit : c'est la fin exacte d'une période payée
  const cancelAt = parisMidnight(year, month + monthsAhead, 1)
  // Dernier jour de location : la veille, 23 h 59 min 59 s
  const endingDate = new Date(cancelAt.getTime() - 1000)
  return { endingDate, cancelAt }
}

export function frDay(d: Date | string) {
  return new Date(d).toLocaleDateString('fr-FR', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' })
}
