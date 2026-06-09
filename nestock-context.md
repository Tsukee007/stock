# Nestock - Contexte projet complet

## Stack technique
- Next.js 14, TypeScript, Tailwind CSS v3
- Supabase (auth, DB, storage, realtime)
- Stripe Connect
- Mapbox GL
- Nodemailer SMTP Hostinger
- Vercel (production)

## URLs et accès
- Production : https://nestock.tsukee.fr
- Backup : https://stock-kb8s.vercel.app
- Repo GitHub : https://github.com/Tsukee007/stock
- Codespace : "probable orbit"
- Supabase : https://rkcewsargthrbiokhend.supabase.co

## Workflow établi
- Editer les fichiers via VS Code Codespace OU GitHub directement
- Pour les gros fichiers : utiliser Python via terminal (heredoc)
- Eviter backticks dans JSX (space.id devient space['id'])
- Les liens markdown corrompent le code JSX dans le terminal
- Commandes git : git add . && git commit -m "message" && git push origin main
- Si rejet : git pull origin main --rebase && git push origin main
- Variables env : .env.local (Codespace) + Vercel Environment Variables

## Base de données Supabase
Tables : profiles, spaces, space_photos, bookings, messages, reviews, contracts, invoices, notifications

### Statuts bookings
message_only, pending, awaiting_signature, confirmed, active, ending, ended, cancelled

### Colonnes importantes
- bookings : stripe_subscription_id, ending_date, start_date
- profiles : full_name, phone, address, postal_code, city, stripe_account_id, stripe_onboarding_complete
- contracts : reference (auto NST-CTR-YYYY-XXXXX), owner_signed, renter_signed, status
- invoices : reference (auto NST-FAC-YYYY-XXXXX), amount, stripe_payment_id

## Fichiers clés
- app/page.tsx : landing page + carte (connecté)
- app/dashboard/page.tsx : dashboard principal
- app/dashboard/bookings/[id]/page.tsx : détail location
- app/dashboard/bookings/[id]/invoice/[invoiceId]/page.tsx : quittance
- app/contracts/[bookingId]/page.tsx : contrat + signature
- app/spaces/new/page.tsx : création annonce
- app/spaces/[id]/edit/page.tsx : modification annonce
- app/spaces/[id]/page.tsx : détail annonce
- app/messages/page.tsx : messagerie responsive
- app/booking/new/page.tsx : demande de réservation
- app/stripe/connect/page.tsx : onboarding Stripe
- app/(auth)/register/page.tsx : inscription avec adresse
- lib/utils.ts : statusLabels, statusColors, getDaysLeft
- lib/mailer.ts : SMTP Hostinger
- lib/notifications.ts : créer notifications

## Routes API
- /api/bookings/create : créer réservation
- /api/bookings/[id]/status : changer statut (pending/ending/ended)
- /api/contracts/sign : signer contrat + Stripe checkout
- /api/stripe/connect : onboarding Stripe Connect
- /api/stripe/webhook : webhook paiements + quittances
- /api/messages/notify : notifier nouveau message
- /api/spaces/delete : supprimer annonce
- /api/contact-form : formulaire contact

## Composants UI
- Navbar.tsx : responsive avec cloche notifications
- NotificationBell.tsx : notifications temps réel Supabase
- MapWithList.tsx : carte + liste responsive mobile
- SpacesMap.tsx : carte Mapbox
- SearchFilters.tsx : filtres recherche
- PhotoUpload.tsx : upload photos (max 3, 2MB)
- PhotoLightbox.tsx : lightbox photos
- ContractSign.tsx : signature électronique
- BookingAction.tsx : boutons changement statut
- PriceSimulator.tsx : simulateur prix TTC
- DeleteSpaceButton.tsx : suppression annonce
- EditSpaceForm.tsx : formulaire modification annonce
- PayButton.tsx : bouton paiement Stripe

## Fonctionnalités terminées
- Auth (login/register/reset password)
- Carte interactive Mapbox avec marqueurs prix
- Recherche par ville + rayon + filtres
- Création annonce avec photos + simulateur prix
- Modification annonce avec photos
- Page détail annonce avec lightbox photos
- Messagerie temps réel Supabase Realtime
- Emails SMTP Hostinger (messages, contrats, quittances)
- Dashboard propriétaire et locataire
- Flux réservation complet
- Contrat électronique avec signature (case + nom + infos)
- Stripe Connect onboarding propriétaire
- Stripe Subscriptions paiement mensuel récurrent
- Webhook Stripe : activation location + quittances
- Quittances automatiques avec toutes les infos
- Page détail location (dates, parties, contrat, quittances)
- Page visualisation quittance avec impression
- Notifications temps réel (cloche + badge rouge)
- Système d'avis étoiles
- Stats propriétaire (revenus + historique)
- Préavis résiliation 15j avec compteur
- Suppression annonce (protégée si réservation active)
- Landing page claire et sobre
- Pages À propos et Contact
- Responsive mobile (navbar hamburger, toggle liste/carte)

## SMTP Hostinger
- Host : smtp.hostinger.com
- Port : 465
- User : contact@tsukee.fr

## Stripe
- Mode test actuellement (clés pk_test_ / sk_test_)
- Webhook : https://nestock.tsukee.fr/api/stripe/webhook
- API version : 2026-02-25.clover

## Prochaines étapes
1. Corrections landing page
2. Vue propriétaire identique locataire dans dashboard
3. Stripe en production (clés live)
4. CGU / Mentions légales / Politique confidentialité
5. Amélioration UI/UX générale

## Journal des modifications
<!-- Ajouter ici chaque nouvelle fonctionnalité ou correction -->

### Mai 2026
- Landing page sobre (fond blanc, titres gris, boutons bleus)
- Quittances automatiques après paiement Stripe
- Préavis résiliation 15j avec compteur
- Page détail location complète
- Bouton terminer pour locataire ET propriétaire
- Inscription avec adresse, téléphone, ville
- Nouveau contrat format légal français
- Stripe Connect onboarding propriétaire
- Simulateur de prix transparent
- Suppression annonce avec protection
- Notifications temps réel (cloche + badge)
- Flux réservation complet avec contrat
- Messagerie responsive mobile
- Navbar responsive avec hamburger


## Comment mettre à jour ce fichier

Ajouter une modification :
echo "- [DATE] : description" >> /workspaces/stock/nestock-context.md

Committer les changements :
git add nestock-context.md && git commit -m "docs: mise a jour contexte" && git push origin main

Afficher le contenu pour une nouvelle conversation Claude :
cat /workspaces/stock/nestock-context.md


### Corrections en attente - Mai 2026
- Prix incohérent : annonce 7€, contrat 6€, Stripe 6.60€ -> unifier partout
- Contrat : supprimer tel/email dans le formulaire de signature (déjà en en-tête)
- Contrat : afficher prix TTC + détail des charges (Nestock 10% + Stripe)
- Contrat : statut "en attente paiement" alors que paiement reçu -> bug webhook
- Dashboard : renommer bouton "Factures" en "Quittances"
- Page détail location : quittances ne s'affichent pas
- Créer pages CGU et Confidentialité
- Footer présent sur toutes les pages de l'application
- 07/05/2026 : Prix TTC unifie, CGU/Confidentialite, footer about/contact, table invoices creee, statut contrat corrige

### Corrections prioritaires - Mai 2026
- Prix incohérent : 6.95 sur annonce vs 7 sur réservation -> utiliser price_ttc partout avec 2 décimales
- Annonce active ne peut pas être réservée, annonce en préavis réservable après fin préavis
- Après onboarding Stripe -> rediriger vers page détail annonce (pas nouvelle annonce)
- Si compte Stripe existe déjà -> utiliser le compte existant (ne pas recréer)
- Page profil à créer avec infos perso + infos Stripe
- Infos bailleur/locataire obligatoires dans contrat, sinon rediriger vers page profil
- Montants incohérents : contrat 46.03, quittance 45.10, carte 45 -> unifier avec price_ttc 2 décimales
- Revenus dashboard incorrects : 41+6=47 mais affiche 45

### Corrections effectuées - 08/05/2026
- Prix TTC unifié partout avec 2 décimales (price_ttc)
- Annonce active bloquée à la réservation
- Annonce en préavis : affiche date de disponibilité
- Redirection après onboarding Stripe vers page annonce
- Quittances visibles dans page détail location
- Bouton imprimer quittance (PrintButton composant client)
- Pages CGU et Confidentialité créées
- Footer sur pages About et Contact
- Revenus dashboard corrigés
- Statut contrat "Location active" après paiement

### A faire ce soir
- Page profil (infos perso + compte Stripe)
- Infos bailleur/locataire obligatoires dans contrat
- Tester redirection Stripe après onboarding
- Vue propriétaire identique locataire dans dashboard

### Corrections effectuées - 09/05/2026
- Page profil créée avec infos perso + modification email + statut Stripe
- Lien profil dans navbar (clic sur email)
- Champs profil obligatoires (nom, tel, adresse, CP, ville)
- Infos bailleur/locataire dans contrat (email profil + email signature)
- Alerte profil incomplet avant signature contrat
- Bouton signature désactivé si profil incomplet
- Annonce active bloquée à la réservation
- Annonce en préavis : date de disponibilité affichée
- Redirection après onboarding Stripe vers page annonce
- Prix TTC uniformes avec 2 décimales partout
- Revenus dashboard corrigés

### A faire
- Tester redirection Stripe après onboarding
- Vue propriétaire identique locataire dans dashboard
- Stripe Connect avec transferts automatiques vers propriétaire
- Stripe en production (clés live)

### En cours - 09/05/2026
- Stripe Connect transferts automatiques vers propriétaire
- Session Stripe avec application_fee_percent 10% + transfer_data vers stripe_account_id propriétaire
- price_ttc utilisé pour le montant de la session Stripe
- ownerProfile récupéré dans contracts/sign/route.ts pour le stripe_account_id

### Corrections effectuées - 09/05/2026 (suite)
- Badge statut "En location" / "A louer" sur carte, liste et page détail annonce
- Nom propriétaire dans liste annonces
- Carte remontée en 2ème section landing page
- Message d'erreur clair pour réservation en doublon
- Stripe Connect transferts automatiques configurés dans contracts/sign/route.ts

### Corrections effectuées - 10/05/2026
- Dashboard restructuré par sections de statut
- Répartition prix TTC dans page détail annonce
- Nom de l'annonce dans en-tête contrat
- Badge "En location" / "A louer" sur liste, carte et page détail
- Nom propriétaire dans liste annonces
- Carte remontée en 2ème section landing page

### Migration domaine - 10/05/2026
- Nouveau domaine : nestock.pro (anciennement nestock.tsukee.fr)
- Vercel : domaine ajouté
- Supabase : URLs mises à jour
- Stripe : webhook mis à jour vers nestock.pro
- Email : contact@nestock.pro créé sur Hostinger
- Variables Vercel mises à jour
- Code : toutes les références nestock.tsukee.fr remplacées
- Pages forgot-password et reset-password existantes et fonctionnelles

### Bugs à corriger - 11/05/2026
- Page annonce : masquer bouton réservation pour le propriétaire
- Page réservation : rediriger après envoi de la demande
- Contrat : afficher adresse du local
- Contrat propriétaire : rediriger après signature
- Dashboard : statuts incohérents entre proprio et locataire
- Navbar : accès profil et Stripe plus visible
- Stripe Connect : ne pas proposer aux locataires

### Bugs prioritaires - 11/05/2026
- Page annonce : masquer bouton réservation pour le propriétaire de l'annonce
- Page réservation : rediriger vers messages après envoi de la demande (page reste figée)
- Contrat : afficher adresse complète du local dans article 1
- Contrat propriétaire : rediriger vers dashboard après signature
- Dashboard : statuts incohérents proprio vs locataire
- Navbar : accès profil et Stripe plus visible (pas seulement via email)
- Stripe Connect : ne pas proposer aux locataires, uniquement aux propriétaires
- Lien reset password invalide (Supabase redirect URLs à configurer)

### Workflow GitHub Codespace
- Codespace : "probable orbit"
- Toujours utiliser Python pour éditer les fichiers complexes
- Eviter backticks dans JSX -> utiliser space['id']
- Git : git add . && git commit -m "message" && git push origin main
- Si rejet : git pull origin main --rebase && git push origin main
- Pour afficher le contexte : cat /workspaces/stock/nestock-context.md

### Corrections effectuées - 09/06/2026
- Bouton réservation masqué pour le propriétaire sur page annonce
- Redirection vers messages après envoi demande de réservation
- Stripe Connect uniquement affiché pour les propriétaires (page profil)
- Redirection vers dashboard après signature propriétaire dans contrat
- Navbar : lien profil visible en desktop (bouton) et mobile (barre du bas + menu hamburger)

### Corrections effectuées - 09/06/2026 (suite)
- Route API /api/stripe/portal créée pour accès portail paiement locataire
- Lien dashboard Stripe pour propriétaire connecté dans page profil
- Lien portail paiement Stripe pour locataire actif dans page profil
- NEXT_PUBLIC_SITE_URL mis à jour vers https://nestock.pro dans Vercel
- Webhook Stripe : gestion annulation abonnement par locataire (customer.subscription.deleted / cancel_at_period_end)
- Notification + email au propriétaire quand locataire annule sur Stripe
- Booking passé en statut "ending" automatiquement lors d'une annulation Stripe

### A faire - Process résiliation complet
- Bouton "Donner mon préavis" dans dashboard locataire
- Notification propriétaire avec bouton "Accusé de réception"
- Si propriétaire ne valide pas sous 15j -> résiliation automatique (cron Vercel)
- Email récapitulatif aux deux parties
- FAQ et landing page : expliquer le process de résiliation
- Webhook Stripe annulation abonnement : testé via SQL Supabase, fonctionne (statut ending + notification)
- Stripe CLI non installable depuis Codespace (domaine bloqué)
