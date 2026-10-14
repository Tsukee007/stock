# Test du reversement aux propriétaires (mode test Stripe + base Nestock-tests)

À lancer depuis la racine du dépôt, avec le site local (`npm run dev`) et le relais Stripe (`stripe listen … --forward-to localhost:3000/api/stripe/webhook`) en route.
Chaque script refuse de tourner si `.env.local` ne pointe pas vers Nestock-tests ou si la clé Stripe n'est pas une clé de test.

1. `node scripts/test-reversement/setup.mjs` : crée un espace (inactif), une réservation, un contrat signé, puis un abonnement Stripe de 56,08 €/mois sur une horloge de test (Test Clock). Relie le compte Express de test au propriétaire de test.
2. `node scripts/test-reversement/t1.mjs` : 1er paiement (événement `checkout.session.completed` signé localement) → transfert de 50 € attendu.
3. `node scripts/test-reversement/t2.mjs` : avance l'horloge de 32 jours → mensualité (`invoice.paid`) → 2e transfert de 50 € attendu.
4. `node scripts/test-reversement/t3.mjs` : fin de location 10 jours après → remboursement au prorata + reprise de la même proportion au propriétaire.

Les identifiants du scénario en cours sont dans `state.json` (non commité). Relancer `setup.mjs` pour un nouveau scénario.
