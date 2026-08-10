# Nestock - Contexte projet complet

## Stack technique
- Next.js 16.2.0 (Turbopack), TypeScript, Tailwind CSS v3
- Supabase (auth, DB, storage, realtime)
- Stripe Connect
- Mapbox GL
- Nodemailer SMTP Hostinger
- Vercel (production)

## URLs et accès
- Production : https://nestock.pro (anciennement nestock.tsukee.fr)
- Backup : https://stock-kb8s.vercel.app
- Repo GitHub : https://github.com/Tsukee007/stock
- Codespace : "probable orbit"
- Supabase : https://rkcewsargthrbiokhend.supabase.co

## Statut actuel du projet
Waitlist désactivée (10/08/2026) : inscription directe ouverte sur toute la plateforme. Priorité produit : finaliser le site, puis bascule complète sur le marketing/acquisition.

## Workflow établi
- Editer les fichiers via VS Code Codespace OU GitHub directement
- Pour les gros fichiers : utiliser Python heredoc (python3 << 'PYEOF') ou un heredoc bash direct (cat > fichier << 'EOF' ... EOF) — plus fiable que le copier-coller manuel dans l'éditeur VS Code, qui a déjà causé des corruptions de fichier (voir incident du 10/08)
- Toujours vérifier `head -5` ET `tail -5` du fichier modifié avant de commit après une édition manuelle importante
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
- source : tiktok / facebook / instagram / reddit / direct / referral (tracking UTM)
- Conservée pour historique et données déjà collectées, mais plus utilisée comme porte d'entrée du site

### Table editorial_calendar
- id, date, reseau, angle, contenu, lien, statut, vues, likes, clics, commentaires, created_at
- statut : a_publier / publie / en_cours / reporte
- reseau : tiktok / facebook / instagram / reddit

## Fichiers clés
- app/page.tsx : landing page complète (hero photo, vision & valeurs, showcase fonctionnalités, avantages, FAQ, CTA final)
- app/layout.tsx : layout racine, inclut AnnouncementBanner + Navbar
- app/waitlist/page.tsx : redirect() vers / (contenu recyclé sur la homepage)
- app/admin-waitlist/page.tsx : dashboard admin waitlist avec stats (conservé pour historique)
- app/admin-calendar/page.tsx : calendrier editorial avec stats par reseau
- app/dashboard/page.tsx : dashboard principal, unifié propriétaire/locataire (pas de vue séparée par rôle — affiche les deux sections selon les données de l'utilisateur)
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
- components/ui/Navbar.tsx : navbar responsive, inclut le composant Logo
- components/Logo.tsx : logo Nestock (carré bleu #1D4ED8, toit terracotta #E86A33, silhouette carton blanche), fidèle à l'identité visuelle
- components/AnnouncementBanner.tsx : bandeau de notoriété affiché sur tout le site (au-dessus de la Navbar)
- components/FAQSection.tsx : FAQ homepage, accordéon interactif (7 questions)
- components/FeatureShowcase.tsx : showcase fonctionnalités homepage, onglets interactifs (Carte/Messagerie/Dashboard/Contrat/Quittances)
- lib/utils.ts : statusLabels, statusColors, getDaysLeft
- lib/mailer.ts : SMTP Hostinger, fonction sendEmail générique
- lib/notifications.ts : créer notifications
- middleware.ts : contrôle d'accès pré-lancement, désactivé via flag WAITLIST_ACTIVE = false (logique conservée pour réactivation future)
- public/images/hero-garage.jpg : photo hero de la homepage (hébergée localement, remplace un lien Lovable temporaire)

## Routes API
- /api/waitlist : inscription waitlist + email confirmation (phases lancement + lien parrainage) + email notification admin (route conservée, plus liée au parcours principal)
- /api/admin-waitlist : dashboard stats waitlist (protege par mot de passe)
- /api/admin-calendar : calendrier editorial CRUD (protege par mot de passe)
- /api/bookings/create : créer réservation
- /api/bookings/[id]/status : changer statut
- /api/contracts/sign : signer contrat + Stripe checkout
- /api/stripe/connect : onboarding Stripe Connect
- /api/stripe/webhook : webhook paiements + quittances (exclu du middleware pre-lancement)
- /api/messages/notify : notifier nouveau message
- /api/spaces/delete : supprimer annonce
- /api/contact-form : formulaire contact

## Middleware
```
const WAITLIST_ACTIVE = false // desactive le 10/08/2026, inscription directe ouverte
```
PUBLIC_PATHS (utilisés uniquement si WAITLIST_ACTIVE repasse à true) :
```
/waitlist, /admin-waitlist, /admin-calendar,
/api/waitlist, /api/admin-waitlist, /api/admin-calendar,
/api/stripe/webhook, /_next, /favicon.ico
```
⚠️ Toute nouvelle route API destinée à un service externe (webhook, callback...) doit être ajoutée à PUBLIC_PATHS avant toute réactivation du blocage, sinon redirection 307 non suivie par les services externes.

## Marketing
Dossier : /marketing dans le repo GitHub
- marketing/urls.md, marketing/accroches.md, marketing/calendrier-editorial.md
- marketing/tiktok-posts/ : 10 images PNG 1080x1920 générées avec Pillow
- marketing/scripts-video/, marketing/posts/
- ⚠️ Les posts déjà rédigés référencent probablement encore la liste d'attente ("Rejoins la liste", roadmap de lancement) — à adapter avant publication pour refléter l'inscription directe

## Tracking UTM
- TikTok / Facebook / Instagram / Reddit / Direct : nestock.pro/waitlist?utm=[reseau] (page redirige maintenant vers / en conservant le tracking initial)
- Parrainage : nestock.pro/waitlist?utm_source=referral&utm_medium=email — inclus dans l'email de confirmation waitlist historique

## Réseaux sociaux
- TikTok : @nestock (compte Pro, lien en bio avec UTM)
- Facebook : page Nestock créée
- Instagram : à créer
- Reddit : posts sur r/france et r/immobilier

## SMTP Hostinger
- Host : smtp.hostinger.com / Port : 465 / User : contact@nestock.pro

## Variables Vercel
NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY,
SMTP_USER, SMTP_PASS, ADMIN_PASSWORD, NEXT_PUBLIC_SITE_URL=https://nestock.pro,
STRIPE_SECRET_KEY (mode test), NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (mode test),
STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_MAPBOX_TOKEN

## Stripe
- Mode test actuellement (clés pk_test_ / sk_test_)
- Webhook : https://www.nestock.pro/api/stripe/webhook (www obligatoire — Stripe ne suit pas les redirections)
- API version observée : 2026-03-25.dahlia

### Points d'attention Stripe (appris à la dure)
- Stripe ne suit jamais les redirections HTTP (307/308) sur les webhooks
- Bug corrigé le 20/07/2026 : middleware pre-lancement redirigeait /api/stripe/webhook, cassant tous les webhooks silencieusement. Fix : exclusion dans PUBLIC_PATHS, puis flag WAITLIST_ACTIVE=false depuis le 10/08
- À revalider systématiquement lors du passage en mode live

## RGPD / Emails
- Emails transactionnels : pas de consentement explicite requis (intérêt légitime)
- Emails marketing : nécessitent une case de consentement explicite séparée — pas encore ajoutée, à décider selon besoin futur
- Lien de désinscription et mention RGPD obligatoires sur tout email et formulaire de collecte

## Identité visuelle
- Bleu confiance #1D4ED8 (actions, liens, logo)
- Terracotta carton #E86A33 (accents, CTA local)
- Anthracite #0F172A (titres, texte)
- Blanc cassé #F8FAFC (fonds)
- Gris ardoise #64748B (texte secondaire)
- Typographie : Manrope 500 (titres), Inter 400 (texte courant)
- Valeurs de marque : Proximité, Confiance, Accessibilité, Impact local (déclinées dans la section Vision & Valeurs de la homepage)
- Logo : carré bleu arrondi, toit terracotta, silhouette de carton blanche — implémenté dans components/Logo.tsx

## Fonctionnalités terminées
- Auth (login/register/reset password)
- Carte interactive Mapbox avec marqueurs prix
- Recherche par ville + rayon + filtres
- Création/modification annonce avec photos + simulateur prix
- Page détail annonce avec lightbox photos
- Messagerie temps réel Supabase Realtime
- Emails SMTP Hostinger
- Dashboard unifié propriétaire/locataire
- Flux réservation complet, contrat électronique avec signature
- Stripe Connect onboarding + Subscriptions + webhook + quittances automatiques
- Notifications temps réel, système d'avis étoiles, stats propriétaire
- Préavis résiliation 15j, suppression annonce protégée
- Dashboard admin waitlist + calendrier éditorial (conservés, historique)
- Inscription directe ouverte (waitlist désactivée)
- Homepage refaite : hero avec photo réelle, badge "Airbnb du stockage", section Vision & Valeurs, showcase fonctionnalités interactif, FAQ enrichie (7 questions)
- Vrai logo intégré (navbar), bandeau de notoriété sur tout le site
- Corrections qualité : attribution PCI-DSS correcte, ~30 accents corrigés sur la homepage, 3 sur le dashboard, cohérence vouvoiement vérifiée

## Prochaines étapes
1. Cron job résiliation automatique à 15 jours
2. Stripe en production (clés live) — revalider le webhook après bascule
3. Auditer accents/tutoiement sur le reste du site (contrats, quittances, messagerie, pages À propos/Contact/CGU — pas encore vérifiées)
4. Adapter les posts du calendrier éditorial existant (CTA waitlist obsolètes) avant publication
5. Une fois le site jugé fini : bascule complète sur le marketing

## Journal des modifications

### 10/08/2026 — Refonte homepage + retrait waitlist
- Waitlist désactivée (WAITLIST_ACTIVE = false dans middleware.ts, logique conservée), inscription directe ouverte partout
- Page /waitlist transformée en redirect() vers /, contenu utile recyclé sur la homepage
- Nouveau Hero : titre "Le garage de votre voisin vaut mieux qu'un box en zone industrielle", badge terracotta "L'Airbnb du stockage entre particuliers", photo réelle de garage hébergée localement (public/images/hero-garage.jpg), carte "Exemple d'annonce" en overlay
- Nouvelle section Vision & Valeurs (fond bleu) : citation + 4 valeurs (Proximité, Confiance, Accessibilité, Impact local)
- FAQSection.tsx créé : FAQ enrichie à 7 questions avec accordéon interactif
- FeatureShowcase.tsx créé : showcase interactif à onglets (Carte/Messagerie/Dashboard/Contrat/Quittances)
- AnnouncementBanner.tsx créé et intégré dans layout.tsx : bandeau de notoriété sur tout le site
- Logo.tsx créé, fidèle à l'identité visuelle, intégré dans Navbar.tsx à la place de l'emoji
- Footer harmonisé avec la nouvelle accroche
- Attribution PCI-DSS corrigée (Stripe certifié, pas Nestock) — suite à l'audit critique demandé à Lovable
- ~30 corrections d'accents sur app/page.tsx, 3 sur app/dashboard/page.tsx
- Vérification dashboard : déjà unifié propriétaire/locataire depuis le 10/05/2026, aucune action nécessaire
- Incident : plusieurs corruptions successives de app/page.tsx (contenu remplacé par du texte de commande git ou par le mauvais bloc de code lors de copier-collers manuels dans VS Code). Résolu définitivement via une commande heredoc unique lancée dans le terminal plutôt que par édition manuelle dans l'éditeur

### 20/07/2026
- Email de confirmation waitlist enrichi : phases de lancement + lien de parrainage UTM
- Bug webhook Stripe corrigé : middleware redirigeait /api/stripe/webhook, cassant les webhooks. Fix initial via PUBLIC_PATHS, remplacé depuis par le flag WAITLIST_ACTIVE

### Juin 2026 — Phase marketing et pre-lancement
- Page waitlist complète, formulaire RGPD, tracking UTM par source
- Emails automatiques confirmation + notification admin
- Middleware pre-lancement, dashboards admin waitlist et calendrier éditorial
- Calendrier éditorial 37 posts / 4 réseaux, 10 images TikTok générées avec Pillow
- Dossier marketing organisé dans GitHub, scripts vidéos, posts rédigés

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
- Page profil créée avec infos perso + modification email + statut Stripe
- Lien profil dans navbar (clic sur email)
- Champs profil obligatoires (nom, tel, adresse, CP, ville)
- Infos bailleur/locataire dans contrat (email profil + email signature)
- Alerte profil incomplet avant signature contrat
- Bouton signature désactivé si profil incomplet
- Stripe Connect transferts automatiques vers propriétaire (application_fee_percent 10% + transfer_data)
- price_ttc utilisé pour le montant de la session Stripe
- Badge statut "En location" / "A louer" sur carte, liste et page détail annonce
- Nom propriétaire dans liste annonces
- Carte remontée en 2ème section landing page
- Message d'erreur clair pour réservation en doublon
- Dashboard restructuré par sections de statut
- Répartition prix TTC dans page détail annonce
- Nom de l'annonce dans en-tête contrat

### Migration domaine - 10/05/2026
- Nouveau domaine : nestock.pro (anciennement nestock.tsukee.fr)
- Vercel : domaine ajouté
- Supabase : URLs mises à jour
- Stripe : webhook mis à jour vers nestock.pro
- Email : contact@nestock.pro créé sur Hostinger
- Variables Vercel mises à jour
- Code : toutes les références nestock.tsukee.fr remplacées
- Pages forgot-password et reset-password existantes et fonctionnelles

### Bugs prioritaires - 11/05/2026 (à vérifier si toujours d'actualité)
- Page annonce : masquer bouton réservation pour le propriétaire de l'annonce
- Page réservation : rediriger vers messages après envoi de la demande (page reste figée)
- Contrat : afficher adresse complète du local dans article 1
- Contrat propriétaire : rediriger vers dashboard après signature
- Dashboard : statuts incohérents proprio vs locataire
- Navbar : accès profil et Stripe plus visible (pas seulement via email)
- Stripe Connect : ne pas proposer aux locataires, uniquement aux propriétaires
- Lien reset password invalide (Supabase redirect URLs à configurer)

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