# Nestock — Fonctionnalités de la plateforme

*Document de référence produit & technique — mis à jour le 10/08/2026*

---

## 1. Vue d'ensemble

**Nestock** est une marketplace française qui connecte des particuliers disposant d'un espace de stockage inutilisé (garage, cave, grenier) avec des particuliers cherchant une solution de stockage locale et abordable — sur le modèle de l'Airbnb du stockage entre particuliers.

La plateforme gère l'intégralité du parcours : découverte de l'espace, mise en relation, contractualisation électronique, paiement récurrent sécurisé, et résiliation — sans intervention manuelle de l'équipe Nestock à aucune étape.

**Modèle économique :** commission de 10% prélevée sur chaque transaction, à la charge du locataire. Le propriétaire perçoit l'intégralité du loyer qu'il a fixé.

---

## 2. Fonctionnalités par domaine

### 2.1 Authentification & Profils
Inscription et connexion par email/mot de passe, réinitialisation de mot de passe. Chaque utilisateur dispose d'un profil unique avec informations personnelles (nom, téléphone, adresse complète) et statut de connexion Stripe. Un même compte peut être à la fois propriétaire et locataire.

*Technique : Supabase Auth. Champs profil obligatoires avant signature de contrat (alerte + blocage du bouton signature si profil incomplet).*

### 2.2 Annonces
Création d'annonce avec photos (jusqu'à 3), simulateur de prix transparent affichant la répartition TTC, géolocalisation. Modification et suppression possibles (suppression bloquée si une réservation active existe, pour éviter de casser une location en cours).

*Technique : `app/spaces/new`, `app/spaces/[id]/edit`, composant `PhotoUpload` (max 3, 2Mo), `DeleteSpaceButton` avec vérification `hasActiveBooking`.*

### 2.3 Recherche & Carte interactive
Carte Mapbox avec marqueurs de prix, recherche par ville, filtres par rayon de distance, type d'espace et fourchette de prix. Bascule liste/carte sur mobile.

*Technique : Mapbox GL, `SearchFilters` + `MapWithList`, calcul de distance haversine côté serveur (`getDistanceKm`).*

### 2.4 Messagerie
Messagerie intégrée en temps réel entre propriétaire et locataire, liée à chaque réservation. Notifications automatiques à chaque nouveau message.

*Technique : Supabase Realtime, route `/api/messages/notify`.*

### 2.5 Réservation & Contrat électronique
Flux de réservation complet : demande → acceptation/refus par le propriétaire → génération automatique d'un contrat de location au format légal français → signature électronique des deux parties (valeur juridique équivalente à une signature manuscrite, article 1366 du Code civil) → activation du paiement.

*Technique : statuts `pending` → `awaiting_signature` → `confirmed` → `active`. Référence contrat auto-générée (format `NST-CTR-AAAA-XXXXX`). Infos bailleur/locataire injectées depuis les profils.*

### 2.6 Paiement & Facturation récurrente
Paiement mensuel automatique via Stripe Subscriptions. Le propriétaire reçoit ses fonds directement sur son compte bancaire via Stripe Connect (virement automatique, sans intermédiaire), avec la commission de 10% prélevée automatiquement (`application_fee_percent`). Aucune donnée bancaire ne transite par les serveurs Nestock — tout est géré par Stripe, certifié PCI-DSS niveau 1.

*Technique : Stripe Connect (onboarding propriétaire) + Stripe Subscriptions (côté locataire) + webhook `/api/stripe/webhook` pour la synchronisation des paiements. Prix TTC unifié (`price_ttc`, 2 décimales) utilisé pour le montant de la session Stripe.*

### 2.7 Quittances automatiques
Une quittance de loyer officielle est générée et envoyée par email aux deux parties après chaque paiement mensuel (premier paiement et paiements récurrents). Consultable et imprimable depuis le dashboard.

*Technique : génération HTML côté serveur (`generateQuittanceHtml`), déclenchée par les events Stripe `checkout.session.completed` et `invoice.paid`. Référence auto-générée (`NST-FAC-AAAA-XXXXX`).*

### 2.8 Résiliation avec préavis de 15 jours
Locataire ou propriétaire peut initier une résiliation, déclenchant un préavis de 15 jours affiché en compte à rebours sur le dashboard des deux parties. L'autre partie peut accuser réception du préavis. Une fois le préavis écoulé, la location se termine **automatiquement**, sans action manuelle :
- Le prélèvement Stripe est annulé (programmé précisément à la date de fin, indépendamment de la date anniversaire de facturation)
- Si un prélèvement mensuel est déjà tombé pendant le préavis, le **prorata des jours non utilisés est automatiquement remboursé** au locataire
- Les deux parties sont notifiées (in-app + email)
- L'annonce redevient disponible à la location

*Technique : colonnes `notice_initiated_by`, `notice_acknowledged_at`, `ending_date` sur `bookings`. Annulation Stripe programmée via `subscriptions.update({ cancel_at })` au moment du déclenchement du préavis (et non à son terme, pour garantir qu'aucun nouveau prélèvement complet ne se déclenche entre-temps). Calcul et remboursement du prorata dans le webhook `customer.subscription.deleted` (comparaison `period_start`/`period_end` de la dernière facture Stripe vs `ending_date`). Cron job quotidien (`/api/cron/end-bookings`, Vercel Cron, 2h du matin) qui bascule les réservations en `ended` une fois `ending_date` dépassée.*

### 2.9 Notifications
Notifications en temps réel (cloche + badge) pour toute action pertinente : nouvelle demande, signature, paiement, message, préavis, résiliation, remboursement. Doublées par email pour les événements importants.

*Technique : table `notifications`, fonction `createNotification()` réutilisée dans toutes les routes concernées.*

### 2.10 Avis & Réputation
Système d'avis étoiles bidirectionnel (locataire → propriétaire) déclenché à la fin d'une location.

### 2.11 Dashboard unifié
Un seul tableau de bord qui affiche automatiquement, pour l'utilisateur connecté :
- Ses annonces et les réservations reçues (organisées par statut : demandes, en attente de signature, en attente de paiement, actives, en préavis, terminées)
- Ses propres locations en tant que locataire
- Ses statistiques (revenus mensuels, nombre de locations, quittances)

Pas de distinction de "rôle" figée : un même utilisateur voit les deux facettes selon ses données réelles.

### 2.12 Panels d'administration
- `/admin-waitlist` : historique des inscriptions à l'ancienne liste d'attente (période pré-lancement), statistiques et sources de trafic (UTM)
- `/admin-calendar` : calendrier éditorial marketing (2 mois, 37 posts sur 4 réseaux), suivi des performances par publication

*Protégés par mot de passe (`ADMIN_PASSWORD`), session persistante via localStorage.*

### 2.13 Identité de marque & Landing page
Landing page publique avec : bandeau de notoriété, hero avec photo réelle et proposition de valeur ("L'Airbnb du stockage entre particuliers"), section Vision & Valeurs (Proximité, Confiance, Accessibilité, Impact local), showcase interactif des fonctionnalités, section de réassurance dédiée aux paiements Stripe, FAQ enrichie (7 questions), simulateur de revenus propriétaire.

Identité visuelle propre : logo dédié, palette de couleurs (bleu confiance + terracotta), typographie Manrope/Inter.

### 2.14 Conformité RGPD
Mentions RGPD sur tous les formulaires de collecte, lien de désinscription sur les emails, distinction claire entre emails transactionnels (sans consentement requis) et marketing (consentement explicite requis, à activer si besoin futur). Pages CGU et Politique de confidentialité.

---

## 3. Stack technique (résumé)

| Composant | Technologie |
|---|---|
| Framework | Next.js 16.2.0 (Turbopack), TypeScript |
| Styles | Tailwind CSS v3 |
| Base de données / Auth | Supabase (Postgres, Auth, Storage, Realtime) |
| Paiements | Stripe Connect + Subscriptions |
| Carte | Mapbox GL |
| Emails | Nodemailer / SMTP Hostinger |
| Hébergement | Vercel |
| Tâches planifiées | Vercel Cron |

---

## 4. Statut actuel

**En production, fonctionnel de bout en bout** (mode Stripe test). Inscription ouverte directement, sans liste d'attente.

**Reste avant lancement public complet :**
- Passage Stripe en mode production (clés live) — démarche SIRET en cours pour le KYC
- Audit final des accents/tutoiement sur les pages secondaires (contrats, quittances, CGU)
- Bascule complète des efforts vers l'acquisition marketing une fois le site jugé finalisé

---

*Ce document est distinct de `nestock-context.md`, qui sert de journal technique détaillé (bugs rencontrés, historique des sessions de développement, fichiers modifiés). Celui-ci se concentre sur une vue fonctionnelle du produit, utile pour une présentation externe ou un onboarding rapide.*