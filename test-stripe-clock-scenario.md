# Scénario de test — Préavis, annulation programmée et remboursement au prorata

Ce document décrit comment valider en quelques minutes tout le cycle :
facturation mensuelle → déclenchement du préavis → annulation Stripe programmée (`cancel_at`) → remboursement automatique au prorata.

Utilise les **Stripe Test Clocks**, une fonctionnalité qui simule l'écoulement du temps sans attendre de vrais cycles de facturation. Fonctionne uniquement en mode test.

⚠️ Fais bien ce test en mode **test** Stripe (jamais en mode live).

---

## Préparation

1. Va sur [dashboard.stripe.com/test/test-clocks](https://dashboard.stripe.com/test/test-clocks)
2. Clique **"Create a test clock"**
3. Note l'heure de départ (par défaut : maintenant)

---

## Étape 1 — Créer un client et une souscription rattachés au test clock

1. Toujours dans l'interface du Test Clock créé, clique **"Create customer"** — ça crée un client Stripe rattaché à l'horloge
2. Attache une carte de test au client (utilise le numéro `4242 4242 4242 4242`, n'importe quelle date future, n'importe quel CVC)
3. Crée une subscription pour ce client, en utilisant le même produit/prix que celui utilisé par une annonce réelle sur Nestock (regarde dans Stripe → Produits pour retrouver le `price_id` utilisé par une annonce test)

**Alternative plus réaliste :** au lieu de créer la subscription manuellement dans le Dashboard, fais une vraie réservation de test sur `nestock.pro` (en mode test) avec un compte locataire de test, et **rattache après coup** le client Stripe généré à un test clock via l'API (`stripe.testHelpers.testClocks.create()` puis migration du client dessus) — plus fidèle à un vrai parcours utilisateur, mais plus long à mettre en place. Pour un premier test, la méthode manuelle ci-dessus suffit à valider la logique serveur.

**✅ Vérification à ce stade :**
- Dans Supabase, table `bookings` : crée (ou identifie) manuellement une ligne de réservation de test avec `stripe_subscription_id` = l'ID de la subscription que tu viens de créer, `status = 'active'`

---

## Étape 2 — Avancer le temps jusqu'au premier prélèvement

1. Dans l'interface du Test Clock, clique **"Advance clock"**
2. Avance de quelques jours (juste après la date de création de la subscription) pour déclencher le premier `invoice.paid`

**✅ Vérifications :**
- Dans Stripe → Webhooks → ton endpoint → onglet "Tentatives récentes" : l'event `invoice.paid` doit apparaître avec un statut **200**
- Dans Supabase, table `invoices` : une nouvelle ligne doit apparaître avec `status = 'paid'`
- Email de quittance reçu (vérifie la boîte mail du locataire de test)

---

## Étape 3 — Déclencher le préavis pendant la période déjà facturée

1. Depuis l'interface Nestock (ou directement en appelant l'API), déclenche le préavis sur cette réservation :
   ```bash
   curl -X POST https://www.nestock.pro/api/bookings/{BOOKING_ID}/status \
     -H "Content-Type: application/json" \
     -H "Cookie: [ta session Supabase]" \
     -d '{"status": "ending"}'
   ```
   (Plus simple : connecte-toi avec le compte locataire ou propriétaire de test sur le site et clique le bouton "Résilier" depuis le dashboard)

2. Vérifie immédiatement dans Stripe → la subscription concernée → elle doit maintenant afficher **"Cancels on [date]"** (le `cancel_at` programmé)

**✅ Vérifications :**
- Dans Supabase, `bookings.status = 'ending'`, `ending_date` renseignée (15 jours après le déclenchement)
- Dans Stripe, la subscription montre bien la date d'annulation programmée
- Notification + email de préavis reçus par l'autre partie

---

## Étape 4 — Avancer le temps jusqu'à la date d'annulation programmée

**C'est le cœur du test** — le scénario qui nous intéresse vraiment : est-ce que `cancel_at` déclenche bien l'annulation à la bonne date, et le remboursement se calcule-t-il correctement ?

1. Retourne dans l'interface du Test Clock
2. Avance le temps **jusqu'à après `ending_date`** (donc au-delà des 15 jours de préavis simulés)
3. Si une date anniversaire de facturation tombe entre le déclenchement du préavis et `ending_date`, Stripe va d'abord émettre un nouveau `invoice.paid` à cette date — **c'est volontaire, c'est exactement le scénario qu'on veut tester** (le cas où le locataire est facturé un mois complet mais ne reste que quelques jours)
4. Continue d'avancer jusqu'à dépasser `cancel_at`

**✅ Vérifications, dans l'ordre où elles doivent apparaître :**
- Event Stripe `customer.subscription.deleted` reçu par le webhook (statut 200 dans les tentatives récentes)
- Si un prélèvement était tombé pendant le préavis : un event `refund.created` doit apparaître dans Stripe → Paiements → le paiement concerné → l'historique doit montrer un remboursement partiel
- Email "Remboursement au prorata" reçu par le locataire, avec le bon montant
- Notification in-app correspondante visible sur le dashboard du locataire

---

## Étape 5 — Vérifier la clôture finale par le cron

Le cron `/api/cron/end-bookings` tourne une fois par jour (2h du matin) — il ne peut pas être testé via le test clock puisqu'il vérifie la date réelle du serveur, pas celle simulée par Stripe. Pour tester cette dernière étape sans attendre le lendemain :

```bash
curl -X GET https://www.nestock.pro/api/cron/end-bookings \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

**✅ Vérifications :**
- Réponse JSON avec `processed: 1` (ou plus) et le détail du traitement
- `bookings.status = 'ended'` dans Supabase
- Notification + email de fin de location reçus par les deux parties
- L'annonce redevient visible/disponible

---

## Nettoyage après le test

1. Supprime le test clock depuis le Dashboard (ça supprime aussi le client et la subscription de test associés)
2. Supprime la ligne de test dans `bookings` (et `invoices` si créées) directement dans Supabase, pour ne pas polluer tes vraies données ou fausser tes futures statistiques

---

## Points d'échec probables à surveiller

- Si le remboursement ne se déclenche pas : vérifie que `lastInvoice.payment_intent` n'est pas `null` (certains modes de paiement ou configurations ne le renseignent pas systématiquement)
- Si le montant remboursé semble incorrect : le calcul se base sur `period_start`/`period_end` de la **dernière facture payée** — vérifie que cette facture correspond bien à la période englobant `ending_date`
- Si aucun event webhook n'arrive : vérifie que le test clock est bien en mode **test**, et que ton endpoint webhook est bien configuré côté test dans Stripe (pas seulement côté live)