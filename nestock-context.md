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
- lib/mailer.ts : SMTP Hostinger
- lib/notifications.ts : créer notifications
- middleware.ts : redirection pre-lancement vers /waitlist

## Routes API
- /api/waitlist : inscription waitlist + email confirmation + email admin
- /api/admin-waitlist : dashboard stats waitlist (protege par mot de passe)
- /api/admin-calendar : calendrier editorial CRUD (protege par mot de passe)
- /api/bookings/create : créer réservation
- /api/bookings/[id]/status : changer statut
- /api/contracts/sign : signer contrat + Stripe checkout
- /api/stripe/connect : onboarding Stripe Connect
- /api/stripe/webhook : webhook paiements + quittances
- /api/messages/notify : notifier nouveau message
- /api/spaces/delete : supprimer annonce
- /api/contact-form : formulaire contact

## Pages admin (protegees par mot de passe ADMIN_PASSWORD)
- /admin-waitlist : stats inscrits, repartition, sources UTM, liste complete
- /admin-calendar : calendrier editorial 2 mois, stats par reseau, suivi publications

## Middleware pre-lancement
Pages publiques accessibles :
- /waitlist (landing page + formulaire)
- /admin-waitlist (dashboard waitlist)
- /admin-calendar (calendrier editorial)
- /api/waitlist
- /api/admin-waitlist
- /api/admin-calendar
Toutes les autres pages redirigent vers /waitlist

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
- Webhook : https://nestock.pro/api/stripe/webhook
- API version : 2026-02-25.clover

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

## Prochaines étapes
1. Passer Stripe en production (clés live)
2. Retirer le middleware au lancement
3. Vue propriétaire identique locataire dans dashboard
4. CGU / Mentions légales complètes
5. Amelioration UI/UX generale

## Journal des modifications

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
