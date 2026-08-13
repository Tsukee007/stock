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
Waitlist désactivée (10/08/2026) : inscription directe ouverte sur toute la plateforme. Priorité produit : finaliser le site, puis bascule complète sur le marketing/acquisition. Stripe toujours en mode test, passage en production planifié juste avant le lancement public (voir section Stripe dédiée). Démarche de création d'une micro-entreprise en cours (nécessaire pour le SIRET requis par le KYC Stripe), dossier déposé le 10/08/2026, en attente de validation INPI.

## Workflow établi
- Editer les fichiers via VS Code Codespace OU GitHub directement
- Pour les gros fichiers : utiliser Python heredoc (python3 << 'PYEOF') ou un heredoc bash direct (cat > fichier << 'EOF' ... EOF) — plus fiable que le copier-coller manuel dans l'éditeur VS Code, qui a déjà causé des corruptions de fichier (voir incident du 10/08)
- Toujours vérifier `head -5` ET `tail -5` du fichier modifié avant de commit après une édition manuelle importante
- Eviter backticks dans JSX (space.id devient space['id'])
- Les liens markdown corrompent le code JSX dans le terminal
- Pour ajouter du contenu a un fichier existant : utiliser > (ecrase) et non >> (ajoute a la suite) sauf si l'ajout est explicitement voulu — une confusion des deux a duplique tout le contenu de ce fichier une fois (corrige le 10/08)
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
- public/images/hero-garage.jpg : photo hero de la homepage (hébergée localement, remplace un lien Lovable temporaire), reutilisee en fond de la page de connexion
- app/login/page.tsx : page connexion avec la photo hero en fond plein ecran (overlay sombre semi-transparent pour garder le formulaire lisible)
- app/api/cron/end-bookings/route.ts : route du cron job de resiliation automatique a 15 jours (voir section dediee)
- vercel.json : configuration des Vercel Cron Jobs (nouveau fichier, n'existait pas avant)
- app/icon.png : favicon 32x32 (convention Next.js App Router, detection automatique)
- app/apple-icon.png : favicon 180x180 pour iOS (meme convention)

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
- /api/cron/end-bookings : resiliation automatique des locations dont le preavis de 15j est ecoule, protegee par le secret CRON_SECRET (header Authorization Bearer)

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


## Cron job résiliation 15 jours (créé le 10/08/2026)
- Mécanisme choisi : Vercel Cron (natif, gratuit sur plan Hobby a raison d'1 execution/jour) plutôt que Supabase Edge Function + pg_cron — choix justifié par la reutilisation directe de tout le code Node deja existant (lib/mailer.ts, lib/notifications.ts), qui aurait du être reecrit en Deno avec une Edge Function
- Planification : tous les jours a 2h du matin, cron `0 2 * * *` dans vercel.json
- Fonctionnement détaillé de la route /api/cron/end-bookings :
  1. Verifie le header Authorization (doit correspondre a `Bearer ${CRON_SECRET}`), retourne 401 sinon
  2. Cherche tous les bookings avec status = 'ending' ET ending_date deja depassee (comparee a la date du jour)
  3. Pour chaque booking trouve :
     - Annule la subscription Stripe correspondante via stripe.subscriptions.cancel(stripe_subscription_id), si elle existe
     - Met a jour le statut du booking a 'ended' en base
     - Recupere les emails du locataire et du proprietaire via supabase.auth.admin.getUserById
     - Cree une notification in-app pour les deux parties (createNotification, type 'booking_ended', avec lien vers /dashboard/bookings/[id])
     - Envoie un email aux deux parties (sendEmail) confirmant la fin de la location et l'annulation du prelevement automatique
  4. Retourne un resume JSON du traitement (nombre de bookings traites, statut de chacun)
- Verifie deployee et fonctionnelle : `curl -I https://www.nestock.pro/api/cron/end-bookings` retourne 401 (attendu sans le secret), confirmant que la route existe et est bien protegee
- Variable d'environnement CRON_SECRET ajoutee sur Vercel (valeur generee via `openssl rand -hex 32`)

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
STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_MAPBOX_TOKEN, CRON_SECRET (ajoutee le 10/08, protege la route /api/cron/end-bookings)

## Stripe
- Mode test actuellement (clés pk_test_ / sk_test_)
- Webhook : https://www.nestock.pro/api/stripe/webhook (www obligatoire — Stripe ne suit pas les redirections)
- API version observée dans les events reels : 2026-03-25.dahlia
- API version attendue par le SDK npm installe (package "stripe") dans le code : 2026-02-25.clover — utiliser IMPERATIVEMENT cette derniere dans le code (apiVersion du constructeur Stripe), sinon erreur de build TypeScript ("Type is not assignable"). Bug rencontre et corrige le 10/08/2026 dans la route cron end-bookings

### Points d'attention Stripe (appris à la dure)
- Stripe ne suit jamais les redirections HTTP (307/308) sur les webhooks
- Bug corrigé le 20/07/2026 : middleware pre-lancement redirigeait /api/stripe/webhook, cassant tous les webhooks silencieusement. Fix : exclusion dans PUBLIC_PATHS, puis flag WAITLIST_ACTIVE=false depuis le 10/08
- À revalider systématiquement lors du passage en mode live
- Toujours verifier que l'apiVersion utilisee dans le code correspond au typage du SDK Stripe reellement installe via npm, pas a une version vue dans un event webhook ou ailleurs — les deux peuvent diverger

### Passage en production (clés live) — planifié juste avant le lancement public, pas avant

**Avancement étape 1 (KYC / SIRET) — en cours depuis le 10/08/2026 :**
- Constat : pas de SIRET disponible pour completer le KYC Stripe. Une ancienne auto-entreprise existait mais s'est revelee radiee et non reactivable via le Guichet unique ("Cette structure est radiee et ne peut pas faire l'objet de formalites via le Guichet Unique")
- Alternative envisagee puis ecartee : creation d'une societe en Estonie (e-Residency). Ecartee en raison du risque de requalification fiscale francaise (notion de "direction effective" : si la societe est en realite dirigee depuis la France, l'administration francaise peut la considerer comme fiscalement francaise malgre l'immatriculation estonienne), et de la complexite administrative superieure par rapport a une simple micro-entreprise francaise
- Decision : creation d'une nouvelle micro-entreprise (auto-entrepreneur) en France, demarche gratuite et rapide (SIRET generalement obtenu en quelques jours), plutot qu'une structure a l'etranger
- Code APE retenu : 63.12Z "Portails internet" (correspond a l'activite de plateforme de mise en relation en ligne, par opposition a une activite de location directe)
- Description d'activite principale declaree : edition et exploitation d'une plateforme web de mise en relation entre particuliers pour la location d'espaces de stockage, remuneree par une commission sur les transactions
- Documents fournis lors de la demande : attestation sur l'honneur de non-condamnation et de filiation (modele standard base sur l'article A.123-51 du Code de commerce), justificatif de jouissance des locaux (selon situation de logement), declaration d'option du conjoint (obligatoire des lors qu'on est marie, meme sans salarie et meme si le conjoint n'exerce aucune activite dans l'entreprise — case "absence d'activite professionnelle du conjoint dans l'entreprise" cochee)
- Demande de creation deposee aupres de l'INPI (formalites.entreprises.gouv.fr) le 10/08/2026, en attente d'attribution du numero SIRET
- Prochaine action des reception du SIRET : le renseigner avec le RIB dans le Dashboard Stripe pour completer le KYC, puis reprendre les etapes 2 a 6 ci-dessous

Étapes identifiées le 10/08/2026 (discussion, pas encore toutes réalisées) :
1. Compléter la vérification d'identité (KYC) du compte Stripe Nestock dans le Dashboard : SIRET, RIB de l'entreprise, informations légales — Stripe ne débloque le mode live qu'une fois ces informations validées
2. Récupérer les nouvelles clés live : pk_live_... et sk_live_... (différentes des clés test actuelles)
3. Mettre à jour sur Vercel : STRIPE_SECRET_KEY et NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY avec les valeurs live
4. Créer un NOUVEAU webhook côté live dans le Dashboard Stripe — test et live ont des endpoints et des secrets de signature complètement séparés, il ne suffit pas de réutiliser celui de test. Mettre à jour STRIPE_WEBHOOK_SECRET sur Vercel avec le nouveau secret live
5. ⚠️ Point critique spécifique à Nestock : les comptes Stripe Connect des propriétaires, créés en mode test, n'existent pas en mode live. Chaque propriétaire ayant déjà fait son onboarding Stripe Connect devra le REFAIRE après la bascule pour continuer à recevoir ses virements. Prévenir les utilisateurs existants en amont si des propriétaires réels sont déjà inscrits à ce moment-là
6. Tester un vrai paiement de bout en bout avant l'ouverture publique (toi-même, en conditions réelles), et revalider le fonctionnement du nouveau webhook live avec la même méthode qu'en test (curl -I sur l'URL du webhook, vérifier absence de redirection 307, cf. bug de juillet)
- Recommandation : ne pas faire cette bascule trop tôt — le compte Stripe live implique des frais et des obligations de conformité réelles, à activer seulement quand des utilisateurs réels sont prêts à transiger

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
- Logo : carré bleu arrondi, toit terracotta, silhouette de carton blanche — implémenté dans components/Logo.tsx, décliné en favicon (app/icon.png, app/apple-icon.png, même design exporté en PNG via SVG)
- Couleur de marque Stripe #635BFF (violet officiel) utilisée dans la section de réassurance paiement de la homepage. Le mot "Stripe" est affiché en texte stylé (pas en logo SVG) suite à un incident : un premier essai de reproduction du logotype Stripe en SVG était corrompu et affichait "gripe" au lieu de "Stripe" en production — corrigé le 10/08/2026

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
- Homepage refaite : hero avec photo réelle, badge "Airbnb du stockage", section Vision & Valeurs, showcase fonctionnalités interactif, section réassurance Stripe (fond bleu, positionnée avant "Pourquoi choisir Nestock"), FAQ enrichie (7 questions)
- Vrai logo intégré (navbar + favicon), bandeau de notoriété sur tout le site
- Page de connexion avec la photo hero en fond plein écran
- Cron job de résiliation automatique à 15 jours : annulation Stripe + notifications in-app + emails aux deux parties
- Corrections qualité : attribution PCI-DSS correcte, ~30 accents corrigés sur la homepage, 3 sur le dashboard, cohérence vouvoiement vérifiée

## Prochaines étapes
1. Stripe en production (clés live) — étape 1 (SIRET/KYC) en cours, dossier micro-entreprise déposé le 10/08, en attente de validation INPI. Voir les 6 étapes détaillées dans la section Stripe ci-dessus. Prévu juste avant le lancement public, pas avant
2. Auditer accents/tutoiement sur le reste du site (contrats, quittances, messagerie, pages À propos/Contact/CGU — pas encore vérifiées)
3. Appliquer la photo hero en fond sur la page /register également, pour la cohérence avec /login (pas encore fait, seule /login a été traitée)
4. Adapter les posts du calendrier éditorial existant (CTA waitlist obsolètes) avant publication
5. PWA manifest — idée abordée et mise de côté le 10/08/2026, à reconsidérer une fois le site en phase de croissance (permettrait l'installation sur écran d'accueil mobile, mode plein écran sans barre d'adresse)
6. Une fois le site jugé fini : bascule complète sur le marketing

## Journal des modifications

### 10/08/2026 — Refonte homepage, retrait waitlist, cron résiliation, favicon, section Stripe
**Retrait de la waitlist**
- Waitlist désactivée (WAITLIST_ACTIVE = false dans middleware.ts, toute la logique PUBLIC_PATHS conservée en l'état pour réactivation future si besoin), inscription directe ouverte sur toute la plateforme
- Page /waitlist transformée en simple redirect() vers /, après avoir vérifié que tout son contenu utile avait été recyclé ailleurs sur le site
- Vérifié en prod : homepage déjà entièrement câblée sur /register pour tous ses CTA (aucune modification nécessaire de ce côté), redirection /waitlist -> / fonctionnelle

**Refonte de la homepage (app/page.tsx)**
- Nouveau Hero : titre "Le garage de votre voisin vaut mieux qu'un box en zone industrielle" (inspiré d'un exemple Lovable partagé par l'utilisateur, adapté avec les vraies données Nestock), badge terracotta "L'Airbnb du stockage entre particuliers" (style choisi parmi 4 propositions visuelles), photo réelle de garage hébergée localement (public/images/hero-garage.jpg, remplace un lien temporaire vers un projet Lovable), carte "Exemple d'annonce" en overlay avec prix
- Nouvelle section Vision & Valeurs (fond bleu #1D4ED8) : citation "Il existe déjà assez d'espace en France, il suffit de mieux le partager" + 4 valeurs (Proximité, Confiance, Accessibilité, Impact local), recyclées et enrichies depuis l'ancienne page "À propos" de la waitlist
- FAQSection.tsx créé (nouveau composant client, accordéon avec useState) : FAQ enrichie à 7 questions (contre 4 auparavant en simple <details> HTML), recyclée depuis l'ancienne page waitlist
- FeatureShowcase.tsx créé (nouveau composant client) : showcase interactif à onglets (Carte interactive / Messagerie / Dashboard / Contrat & Signature / Quittances auto), recyclé depuis l'ancienne page waitlist, positionné après la section Vision & Valeurs
- Section réassurance Stripe créée, positionnée avant "Pourquoi choisir Nestock" (initialement placée après, déplacée sur demande) : fond bleu, 3 points de réassurance (certification PCI-DSS niveau 1 attribuée à Stripe, données bancaires ne transitant jamais par Nestock, reconnaissance mondiale), sans aucun chiffre inventé
- Footer harmonisé : accroche mise à jour de "La marketplace française du stockage entre particuliers" vers "L'Airbnb du stockage entre particuliers"
- Attribution PCI-DSS corrigée dans la section Avantages (Stripe certifié, pas Nestock) — suite à un audit critique demandé par l'utilisateur à l'IA Lovable sur l'ancienne version du site, qui avait notamment relevé ce point ainsi que le manque de visuels humains et les fautes d'accents
- ~30 corrections d'accents sur app/page.tsx (electronique -> électronique, securise -> sécurisé, proprietaire -> propriétaire, "Comment ca marche" -> "Comment ça marche", etc.), vouvoiement vérifié cohérent sur toute la page (plus aucune trace du tutoiement de l'ancienne page waitlist)

**Vérification dashboard propriétaire/locataire**
- Point historique "vue propriétaire identique locataire" (présent dans le journal depuis mai 2026) vérifié en lisant le code réel de app/dashboard/page.tsx : déjà résolu depuis la restructuration du 10/05/2026. Le dashboard est un composant unique qui affiche automatiquement les sections propriétaire (Mes annonces, réservations reçues par statut) ET locataire (Mes locations) pour l'utilisateur connecté, sans distinction de rôle figée — aucune action nécessaire, point retiré de la liste
- 3 corrections d'accents sur app/dashboard/page.tsx a cette occasion (Recue -> Reçue, premiere -> première, Masquee -> Masquée)

**Identité visuelle appliquée**
- Logo.tsx créé (nouveau composant), fidèle au document d'identité visuelle nestock_identite_visuelle.html : carré bleu #1D4ED8 arrondi, toit terracotta #E86A33, silhouette de carton en blanc, texte "nestock" en minuscules
- Logo intégré dans Navbar.tsx à la place de l'ancien emoji 🗄️
- Favicon généré à partir du même design SVG (converti en PNG via cairosvg en Python) : app/icon.png (32x32) et app/apple-icon.png (180x180), détectés automatiquement par la convention Next.js App Router. Un premier essai de placement dans public/images/ avec déclaration explicite dans les metadata de layout.tsx a été envisagé puis abandonné au profit de la convention app/ native, plus simple

**Page de connexion (app/login/page.tsx)**
- Photo hero (la même que la homepage) appliquée en fond plein écran, avec un overlay sombre semi-transparent (rgba(15,23,42,0.55)) pour garder le formulaire blanc bien lisible par-dessus
- Reste à faire : appliquer la même chose sur /register pour la cohérence (pas encore fait)

**Cron job résiliation 15 jours**
- Choix du mécanisme discuté avec l'utilisateur : Vercel Cron retenu plutôt que Supabase Edge Function + pg_cron, pour rester dans l'écosystème Node existant et réutiliser lib/mailer.ts et lib/notifications.ts sans réécriture
- app/api/cron/end-bookings/route.ts créé : cherche les bookings en statut 'ending' dont ending_date est dépassée, annule la subscription Stripe associée, passe le statut à 'ended', notifie les deux parties (in-app via createNotification + email via sendEmail)
- vercel.json créé (n'existait pas avant) avec la planification quotidienne à 2h du matin
- CRON_SECRET ajoutée en variable d'environnement Vercel pour protéger la route (vérification du header Authorization Bearer)
- Bug rencontré et corrigé : apiVersion Stripe '2026-03-25.dahlia' (vue dans un event webhook réel) incompatible avec le typage du SDK npm installé, qui attend '2026-02-25.clover' — build en échec jusqu'à correction
- Déploiement vérifié via curl -I (401 attendu, confirme que la route existe et est protégée)

**Incidents techniques de la session (résolus)**
- Plusieurs corruptions successives de app/page.tsx : une fois où le contenu a été remplacé par le texte littéral d'une commande git (mauvais copier-coller entre un bloc de code et une commande terminal), une autre fois où le mauvais bloc de code (celui du dashboard) a été collé à la place de celui de la homepage. Résolu définitivement en abandonnant l'édition manuelle dans VS Code au profit d'une commande heredoc unique exécutée directement dans le terminal (cat > fichier << 'EOF' ... EOF), après plusieurs tentatives infructueuses incluant un terminal resté bloqué en attente d'un heredoc précédent non fermé
- app/api/cron/end-bookings/route.ts resté vide après un premier essai de copier-coller dans l'éditeur (fichier créé mais sans contenu, erreur TypeScript "is not a module") — résolu avec la même méthode heredoc
- Fichier nestock-context.md dupliqué intégralement (utilisation de >> au lieu de > lors d'une mise à jour) — repéré et corrigé par l'utilisateur puis par Claude
- Perte de l'historique de mai 2026 (corrections quotidiennes, migration de domaine, bugs prioritaires) lors d'une reconstruction du fichier contexte à partir d'une version déjà tronquée — repéré par l'utilisateur, restauré depuis le tout premier fichier partagé en début de conversation, réinséré dans le bon ordre chronologique

**Section réassurance Stripe — itération**
- Premier essai avec un logo Stripe reproduit en SVG (copié depuis un ancien mockup) : le path SVG était corrompu et affichait le mot "gripe" à la place de "Stripe" en production — repéré par capture d'écran de l'utilisateur, corrigé en remplaçant le logo SVG par le mot "Stripe" en texte stylé (couleur #635BFF)
- Section repositionnée (initialement après "Avantages" et avant FAQ) vers avant la section "Avantages", et fond changé de gris à bleu, sur demande explicite

**Discussion (non implémentée) : passage Stripe en production**
- Les 6 étapes du passage en mode live ont été détaillées avec l'utilisateur (voir section Stripe ci-dessus) mais volontairement reportées à juste avant le lancement public réel, plutôt que faites immédiatement, le site étant encore en phase de finalisation

**PWA manifest**
- Concept expliqué à l'utilisateur (installation du site comme une app sur mobile) à sa demande, mis de côté pour plus tard sur sa décision, à reconsidérer une fois le site en phase de croissance

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