# Nestock - Contexte projet complet

## Stack technique
- Next.js 14, TypeScript, Tailwind CSS v3
- Supabase (auth, DB, storage, realtime)
- Stripe Connect
- Mapbox GL
- Nodemailer SMTP Hostinger
- Vercel (production)

## URLs et accès
- Production : https://nestock.pro
- Backup : https://stock-kb8s.vercel.app
- Repo GitHub : https://github.com/Tsukee007/stock
- Codespace : "probable orbit"
- Supabase : https://rkcewsargthrbiokhend.supabase.co

## Workflow établi
- Editer les fichiers via VS Code Codespace OU GitHub directement
- Pour les gros fichiers : utiliser Python heredoc (python3 << 'PYEOF')
- Eviter backticks dans JSX (space.id devient space['id'])
- Les liens markdown corrompent le code JSX dans le terminal
- Commandes git : git add . && git commit -m "message" && git push origin main
- Si rejet : git pull origin main --rebase && git push origin main
- Variables env : .env.local (Codespace) + Vercel Environment Variables

## Base de données Supabase
Tables : profiles, spaces, space_photos, bookings, messages, reviews, contracts,
invoices, notifications, waitlist, editorial_calendar

### Statuts bookings
message_only, pending, awaiting_signature, confirmed, active, ending, ended, cancelled

### Table waitlist
- id, prenom, email, interet, source, consent_email, consent_rgpd, created_at
- interet : louer / proposer / les_deux
- source : tiktok / facebook / instagram / reddit / direct (tracking UTM)

### Table editorial_calendar
- id, date, reseau, angle, contenu, lien, statut, vues, likes, clics, commentaires, created_at
- statut : a_publier / publie / en_cours / reporte
- reseau : tiktok / facebook / instagram / reddit

## Fichiers clés
- app/page.tsx : landing page + carte (connecté)
- app/waitlist/page.tsx : landing page pre-lancement + formulaire waitlist
- app/admin-waitlist/page.tsx : dashboard admin waitlist avec stats
- app/admin-calendar/page.tsx : calendrier editorial avec stats par reseau
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
- lib/mailer.ts : SMTP Hostinger (fonction sendEmail générique)
- lib/notifications.ts : créer notifications
- middleware.ts : redirection pre-lancement vers /waitlist

## Routes API
- /api/waitlist : inscription waitlist + email confirmation (phases lancement + lien parrainage) + email notification admin
- /api/admin-waitlist : dashboard stats waitlist (protege par mot de passe)
- /api/admin-calendar : calendrier editorial CRUD (protege par mot de passe)
- /api/bookings/create : créer réservation
- /api/bookings/[id]/status : changer statut
- /api/contracts/sign : signer contrat + Stripe checkout
- /api/stripe/connect : onboarding Stripe Connect
- /api/stripe/webhook : webhook paiements + quittances (exclu du middleware pre-lancement, cf. bug corrigé le 20/07)
- /api/messages/notify : notifier nouveau message
- /api/spaces/delete : supprimer annonce
- /api/contact-form : formulaire contact

## Pages admin (protegees par mot de passe ADMIN_PASSWORD)
- /admin-waitlist : stats inscrits, repartition, sources UTM, liste complete
- /admin-calendar : calendrier editorial 2 mois, stats par reseau, suivi publications

## Middleware pre-lancement
Pages publiques accessibles (PUBLIC_PATHS dans middleware.ts) :
- /waitlist (landing page + formulaire)
- /admin-waitlist (dashboard waitlist)
- /admin-calendar (calendrier editorial)
- /api/waitlist
- /api/admin-waitlist
- /api/admin-calendar
- /api/stripe/webhook (ajouté le 20/07/2026, cf. bug ci-dessous)
- /_next
- /favicon.ico
Toutes les autres pages redirigent vers /waitlist

⚠️ Point de vigilance : toute nouvelle route API destinée à un service externe (webhook, callback...) doit être ajoutée à PUBLIC_PATHS avant le lancement, sinon elle est redirigée en 307 vers /waitlist — ce que la plupart des services externes (Stripe compris) ne suivent pas, cassant silencieusement l'intégration.

## Marketing
Dossier : /marketing dans le repo GitHub
- marketing/urls.md : tous les liens UTM par reseau
- marketing/accroches.md : accroches et slogans
- marketing/calendrier-editorial.md : planning 2 mois
- marketing/tiktok-posts/ : 10 images PNG 1080x1920 generees avec Pillow
- marketing/scripts-video/post-starwars.md : script generique Star Wars
- marketing/posts/presentation-nestock.md : posts TikTok et Facebook

## Tracking UTM
- TikTok : nestock.pro/waitlist?utm=tiktok
- Facebook : nestock.pro/waitlist?utm=facebook
- Instagram : nestock.pro/waitlist?utm=instagram
- Reddit : nestock.pro/waitlist?utm=reddit
- Direct : nestock.pro/waitlist (source = direct)
- Parrainage (nouveau 20/07) : nestock.pro/waitlist?utm_source=referral&utm_medium=email — inclus dans l'email de confirmation waitlist pour permettre aux inscrits de transférer le lien

## Reseaux sociaux
- TikTok : @nestock (compte Pro, lien en bio avec UTM)
- Facebook : page Nestock creee
- Instagram : a creer
- Reddit : posts sur r/france et r/immobilier

## SMTP Hostinger
- Host : smtp.hostinger.com
- Port : 465
- User : contact@nestock.pro

## Variables Vercel
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SMTP_USER
- SMTP_PASS
- ADMIN_PASSWORD
- NEXT_PUBLIC_SITE_URL=https://nestock.pro
- STRIPE_SECRET_KEY (mode test)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (mode test)
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_MAPBOX_TOKEN

## Stripe
- Mode test actuellement (clés pk_test_ / sk_test_)
- Webhook : https://www.nestock.pro/api/stripe/webhook (www obligatoire — Stripe ne suit pas les redirections)
- API version observée : 2026-03-25.dahlia

### Points d'attention Stripe (appris à la dure)
- Stripe ne suit jamais les redirections HTTP (307/308) sur les webhooks : ni les divergences www/non-www, ni les redirections imposées par un middleware applicatif
- Bug corrigé le 20/07/2026 : le middleware pre-lancement redirigeait /api/stripe/webhook vers /waitlist en 307, faisant échouer silencieusement tous les webhooks Stripe (invoice.paid notamment). Vérifié résolu via `curl -I https://www.nestock.pro/api/stripe/webhook` (405 au lieu de 307) et renvoi manuel réussi en mode test
- À revalider systématiquement lors du passage en mode live : reconfigurer et retester l'endpoint webhook live indépendamment du mode test

## RGPD / Emails
- Emails transactionnels (confirmation waitlist, contrats, quittances, messages) : pas de consentement explicite requis, relèvent de l'intérêt légitime / de l'exécution d'une action demandée par l'utilisateur
- Emails marketing (newsletters, offres de lancement) : nécessitent une case de consentement explicite séparée type "J'accepte de recevoir des emails de Nestock. Désinscription possible à tout moment" — pas encore ajoutée, à décider selon besoin futur
- Lien de désinscription et mention RGPD obligatoires sur tout email et tout formulaire de collecte

## Fonctionnalités terminées
- Auth (login/register/reset password)
- Carte interactive Mapbox avec marqueurs prix
- Recherche par ville + rayon + filtres
- Création annonce avec photos + simulateur prix
- Modification annonce avec photos
- Page détail annonce avec lightbox photos
- Messagerie temps réel Supabase Realtime
- Emails SMTP Hostinger
- Dashboard propriétaire et locataire
- Flux réservation complet
- Contrat électronique avec signature
- Stripe Connect onboarding propriétaire
- Stripe Subscriptions paiement mensuel récurrent
- Webhook Stripe : activation location + quittances
- Quittances automatiques
- Notifications temps réel
- Système d'avis étoiles
- Stats propriétaire
- Préavis résiliation 15j
- Suppression annonce protégée
- Landing page waitlist pre-lancement complète
- Middleware de redirection pre-lancement
- Dashboard admin waitlist avec stats et tracking UTM
- Dashboard admin calendrier editorial
- 10 images TikTok generees avec Pillow
- Calendrier editorial 2 mois tous reseaux
- Email de confirmation waitlist enrichi : phases de lancement + lien de parrainage UTM (20/07)
- Bug webhook Stripe / middleware corrigé (20/07)

## Prochaines étapes
1. Passer Stripe en production (clés live) — revalider le webhook après bascule
2. Retirer le middleware au lancement
3. Vue propriétaire identique locataire dans dashboard
4. CGU / Mentions légales complètes
5. Amelioration UI/UX generale
6. Decider ajout case consentement marketing sur formulaire waitlist
7. Cron job résiliation automatique 15j

## Journal des modifications

### 20/07/2026
- Email de confirmation waitlist enrichi : bloc "Les prochaines étapes" (3 phases : liste d'attente en cours / version bêta / lancement officiel) + bloc "Fais connaître Nestock" avec lien de parrainage générique trackable en UTM (utm_source=referral&utm_medium=email), directement dans le template HTML existant de app/api/waitlist/route.ts
- Confirmation RGPD : email de confirmation waitlist = transactionnel, pas de case consentement marketing requise pour celui-ci ; case consentement marketing reste à ajouter si newsletters/offres prévues
- Bug webhook Stripe corrigé : le middleware pre-lancement redirigeait /api/stripe/webhook en 307 vers /waitlist (Stripe ne suit pas les redirections) -> tous les webhooks échouaient silencieusement (ex. invoice.paid). Fix : ajout de '/api/stripe/webhook' dans PUBLIC_PATHS du middleware.ts. Vérifié via curl -I (405 au lieu de 307, plus de redirection) et renvoi manuel réussi en mode test
- Point de vigilance noté pour le passage Stripe en mode live : revérifier ce même type de problème (middleware + redirections non suivies)

### Juin 2026 — Phase marketing et pre-lancement
- Page waitlist complete avec landing page, FAQ, A propos, transparence tarifaire
- Mockups CSS des fonctionnalites (carte, messagerie, dashboard, contrat, quittances)
- Photo reelle de la carte integree via imgur
- Formulaire waitlist RGPD avec prenom, email, interet, consentements
- Tracking UTM par source (tiktok, facebook, instagram, reddit, direct)
- Emails automatiques : confirmation inscrit + notification admin
- Middleware pre-lancement : toutes pages redirigent vers /waitlist
- Dashboard admin /admin-waitlist : stats, repartition, sources, liste inscrits
- Dashboard admin /admin-calendar : calendrier editorial 2 mois
- Calendrier editorial avec 37 posts sur 4 reseaux
- Suivi publications : statut, vues, likes, clics, commentaires
- Stats par reseau avec taux de clic
- 10 images TikTok 1080x1920 generees avec Pillow Python
- Dossier marketing organise dans GitHub
- Scripts videos : generique Star Wars, 5 scripts screen recording
- Posts rediges pour TikTok, Facebook, Instagram, Reddit
- Barre de progression scroll dans navbar waitlist
- Logo Nestock cliquable vers le haut de page

## Comment mettre à jour ce fichier

Ajouter une modification :
```bash
echo "- [DATE] : description" >> /workspaces/stock/nestock-context.md
```

Committer les changements :
```bash
git add nestock-context.md && git commit -m "docs: mise a jour contexte" && git push origin main
```

Afficher le contenu pour une nouvelle conversation Claude :
```bash
cat /workspaces/stock/nestock-context.md
```