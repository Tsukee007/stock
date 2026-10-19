# Test du reversement aux propriétaires (mode test Stripe + base Nestock-tests)

À lancer depuis la racine du dépôt, avec le site local (`npm run dev`) et le relais Stripe (`stripe listen … --forward-to localhost:3000/api/stripe/webhook`) en route.
Chaque script refuse de tourner si `.env.local` ne pointe pas vers Nestock-tests ou si la clé Stripe n'est pas une clé de test.

Règles testées (depuis le 19/10/2026) : prélèvement le 1er du mois, premier paiement au prorata des jours restants, fin de location toujours en fin de mois, aucun remboursement.

1. `node scripts/test-reversement/setup.mjs` : crée un espace, une réservation, un contrat signé, puis un abonnement Stripe de 56,08 €/mois ancré au 1er du mois suivant, sur une horloge de test (Test Clock). Le propriétaire de test doit avoir un compte Stripe actif.
2. `node scripts/test-reversement/t1.mjs` : 1er paiement partiel (`checkout.session.completed` signé localement) → reversement de 50 € × la part du mois payée.
3. `node scripts/test-reversement/t2.mjs` : avance l'horloge au 1er du mois → prélèvement du mois entier (`invoice.paid`) → reversement de 50 €.
4. `node scripts/test-reversement/t3.mjs` : préavis, arrêt de l'abonnement le 1er du mois suivant → aucune facture en plus, aucun remboursement, aucune reprise.

Les identifiants du scénario en cours sont dans `state.json` (non commité). Relancer `setup.mjs` pour un nouveau scénario.
