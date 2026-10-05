# Nestock — Pas de test

Cahier de tests destiné à des agents IA (et à un humain si besoin). Chaque test décrit **quoi faire** et **ce qu'on doit obtenir** ; l'agent qui l'exécute **ajoute son retour** dans l'historique du test.

---

## Consignes pour les agents

1. **Environnement** : site de production https://www.nestock.pro, Stripe en **mode test uniquement**. Ne jamais saisir de vraie carte, de vrai IBAN ni de vraie pièce d'identité.
2. **Comptes** : utiliser uniquement des comptes de test (`…+test@…`). Ne jamais modifier ni supprimer les annonces/locations d'un autre utilisateur.
3. **Données de test Stripe** :
   - Carte : `4242 4242 4242 4242`, date future quelconque, CVC quelconque
   - IBAN : `FR1420041010050500013M02606`
   - Code de vérification SMS / identité : `000000`
4. **Choisir un test** : prendre un test dont le statut courant est `À faire` ou `Échec` (re-test après correction). Les tests sont indépendants sauf mention `Prérequis`.
5. **Ne jamais modifier** les sections *Objectif*, *Prérequis*, *Étapes* et *Résultat attendu*. Si une étape est fausse ou obsolète, le signaler dans le retour.
6. **Enregistrer le retour** : ajouter **une ligne** en bas du tableau *Historique* du test (le plus récent en bas), puis mettre à jour la ligne **Statut courant**.
   - Statuts possibles : `À faire` · `OK` · `Échec` · `Bloqué` (impossible à exécuter : accès, données manquantes…) · `Partiel`
   - Colonne *Observations* : ce qui a été vu, l'étape exacte qui bloque, le message d'erreur exact, l'URL atteinte. Pas de supposition sur la cause : la mettre à part, préfixée par `Hypothèse :`.
   - Captures d'écran : les placer dans `tests/captures/` et indiquer le nom du fichier.
7. **Ajouter un test** : copier le modèle en bas du fichier, prendre l'identifiant suivant de la catégorie (`T-STRIPE-03`, …).

---

## Tableau de bord

| ID | Test | Statut courant |
|---|---|---|
| T-STRIPE-01 | Parcours complet : « Accéder à mon compte Stripe » → connexion → formulaire Stripe → tableau de bord Stripe | À faire |
| T-STRIPE-02 | Retours depuis Stripe sur le bon domaine (nestock.pro) | OK |
| T-STRIPE-03 | Déjà connecté, sans compte Stripe → formulaire Stripe direct | À faire |
| T-STRIPE-04 | Inscription Stripe interrompue puis reprise (pas de doublon) | À faire |
| T-STRIPE-05 | Compte Stripe complet → tableau de bord Stripe direct | À faire |
| T-STRIPE-06 | Connexion normale non perturbée (retour après connexion sécurisé) | À faire |
| T-NAV-01 | Menu visiteur non connecté | À faire |
| T-NAV-02 | Menu utilisateur connecté | À faire |
| T-NAV-03 | Pages réservées : redirection vers la connexion | À faire |
| T-DASH-01 | Le Dashboard affiche le tableau de bord, pas la carte | À faire |
| T-MAP-01 | Carte de la page d'accueil : défilement, zoom, déplacement | À faire |
| T-LAND-01 | Contenu de la page d'accueil | À faire |
| T-LAND-02 | Lien Stripe Climate (haut de page + pieds de page) | À faire |

---

## Stripe

### T-STRIPE-01 — Parcours complet de création du compte Stripe

- **Objectif** : depuis la page d'accueil, le bouton « Accéder à mon compte Stripe » amène toujours sur une page Stripe : formulaire de création si le compte n'existe pas, tableau de bord Stripe sinon.
- **Prérequis** : un compte de test Nestock **sans** compte Stripe terminé.
- **Étapes** :
  1. Ouvrir https://www.nestock.pro sans être connecté.
  2. Dans la section « Vos paiements protégés par Stripe », cliquer sur **« Accéder à mon compte Stripe »**.
  3. Lire le message affiché sur la page de connexion, puis se connecter avec le compte de test.
  4. Remplir le formulaire Stripe avec les données de test (voir Consignes) jusqu'au bout.
  5. Noter l'URL et le message de retour.
  6. Revenir sur la page d'accueil et recliquer sur **« Accéder à mon compte Stripe »**.
- **Résultat attendu** :
  - Étape 3 : page `https://www.nestock.pro/login?raison=stripe&next=/api/stripe/dashboard` avec le message « Connectez-vous à Nestock pour accéder à votre compte Stripe… ».
  - Étape 3 (après connexion) : redirection **automatique** vers le formulaire Stripe (domaine `connect.stripe.com`), sans repasser par la page d'accueil.
  - Étape 5 : retour sur `https://www.nestock.pro/stripe/connect?success=true` avec « Compte Stripe connecté ! », **toujours connecté**.
  - Étape 6 : ouverture directe du tableau de bord Stripe Express (`connect.stripe.com`), **sans saisie d'e-mail**.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-STRIPE-02 — Retours depuis Stripe sur le bon domaine

- **Objectif** : toutes les redirections du site utilisent `https://www.nestock.pro` et non l'ancien domaine `nestock.tsukee.fr`.
- **Prérequis** : aucun.
- **Étapes** :
  1. Ouvrir `https://www.nestock.pro/api/logout` (ou exécuter `curl -s -o /dev/null -w '%{redirect_url}' https://www.nestock.pro/api/logout`).
  2. Noter l'URL de redirection.
- **Résultat attendu** : redirection vers `https://nestock.pro/` ou `https://www.nestock.pro/` (le premier redirige vers le second en conservant chemin et paramètres) — jamais `nestock.tsukee.fr`.
- **Statut courant** : OK

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-05 | Claude Code | Échec | Redirection vers `https://nestock.tsukee.fr/` même après reconstruction du site. Hypothèse : la variable `NEXT_PUBLIC_SITE_URL` a été modifiée dans un projet Vercel qui ne sert pas nestock.pro (deux projets : `stock` et `stock-kb8s`). Impacte aussi le retour de l'inscription Stripe (T-STRIPE-01, étape 6). |
| 2026-10-05 | Claude Code | OK | Après modification de `NEXT_PUBLIC_SITE_URL` dans le projet Vercel `stock-kb8s` + redeploy : `/api/logout` redirige vers `https://nestock.pro/`. Vérifié aussi : `https://nestock.pro/stripe/connect?success=true&space_id=abc` → 307 vers `https://www.nestock.pro/stripe/connect?success=true&space_id=abc` (chemin et paramètres conservés). |

### T-STRIPE-03 — Déjà connecté à Nestock, sans compte Stripe

- **Objectif** : un utilisateur déjà connecté arrive directement sur le formulaire Stripe, sans repasser par la connexion.
- **Prérequis** : compte de test Nestock **connecté**, **sans** compte Stripe (jamais cliqué sur le bouton Stripe).
- **Étapes** :
  1. Ouvrir https://www.nestock.pro/api/stripe/dashboard (même effet que le bouton « Accéder à mon compte Stripe », qui n'est visible que sur la page d'accueil visiteur).
  2. Noter la page atteinte.
- **Résultat attendu** : arrivée directe sur le formulaire Stripe (domaine `connect.stripe.com`), sans page de connexion Nestock ni page « Connexion Stripe » intermédiaire.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-STRIPE-04 — Inscription Stripe interrompue puis reprise

- **Objectif** : un propriétaire qui abandonne le formulaire Stripe en cours de route peut le reprendre, sans qu'un second compte Stripe soit créé.
- **Prérequis** : compte de test Nestock connecté, sans compte Stripe terminé.
- **Étapes** :
  1. Ouvrir https://www.nestock.pro/api/stripe/dashboard, remplir **seulement la première page** du formulaire Stripe, puis fermer l'onglet.
  2. Rouvrir https://www.nestock.pro/api/stripe/dashboard.
  3. Dans le tableau de bord Stripe (mode test) → Connect → Comptes connectés, rechercher l'e-mail du compte de test.
- **Résultat attendu** :
  - Étape 2 : retour sur le formulaire Stripe, avec les informations déjà saisies conservées.
  - Étape 3 : **un seul** compte connecté pour cet e-mail.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-STRIPE-05 — Compte Stripe complet : accès direct au tableau de bord

- **Objectif** : un propriétaire dont le compte Stripe est complet arrive directement dans son espace Stripe, sans saisir d'e-mail.
- **Prérequis** : T-STRIPE-01 réussi (compte de test avec compte Stripe complet), être connecté à Nestock.
- **Étapes** :
  1. Ouvrir https://www.nestock.pro/api/stripe/dashboard.
  2. Ouvrir https://www.nestock.pro/stripe/connect et cliquer sur **« Ouvrir mon tableau de bord Stripe »**.
- **Résultat attendu** : dans les deux cas, ouverture directe du tableau de bord Stripe Express (`connect.stripe.com`) du compte de test, sans demande d'e-mail ni de code.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-STRIPE-06 — Connexion normale non perturbée

- **Objectif** : le retour automatique après connexion ne modifie pas la connexion classique, et ne peut pas renvoyer vers un site extérieur.
- **Prérequis** : compte de test Nestock, être déconnecté.
- **Étapes** :
  1. Ouvrir https://www.nestock.pro/login, se connecter.
  2. Se déconnecter, ouvrir `https://www.nestock.pro/login?next=//exemple.com`, se connecter.
     Recommencer avec `https://www.nestock.pro/login?next=/%5Cexemple.com`.
  3. Se déconnecter, ouvrir `https://www.nestock.pro/login?next=/dashboard`, se connecter.
- **Résultat attendu** :
  - Étape 1 : arrivée sur la page d'accueil, sans encadré Stripe sur la page de connexion.
  - Étape 2 (les deux adresses) : arrivée sur la page d'accueil de Nestock, **jamais** sur exemple.com.
  - Étape 3 : arrivée sur le Dashboard.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Navigation

### T-NAV-01 — Menu visiteur non connecté

- **Objectif** : le menu d'un visiteur affiche les bonnes entrées.
- **Prérequis** : être déconnecté.
- **Étapes** :
  1. Ouvrir https://www.nestock.pro sur ordinateur, lire le menu du haut.
  2. Ouvrir le site sur mobile (ou fenêtre de 390 px), ouvrir le menu ☰.
- **Résultat attendu** : entrées dans cet ordre : **Accueil, À propos, Messages, Dashboard, Contact** ; pas d'entrée « Carte » ni « Déposer ».
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-NAV-02 — Menu utilisateur connecté

- **Objectif** : un utilisateur connecté voit en plus « Déposer ».
- **Prérequis** : compte de test connecté.
- **Étapes** :
  1. Lire le menu du haut sur ordinateur.
  2. Sur mobile, lire la barre de navigation fixe en bas d'écran.
- **Résultat attendu** : ordinateur, dans cet ordre : **Accueil, À propos, Messages, Dashboard, Déposer, Contact** ; mobile (barre du bas) : **Accueil, Messages, Dashboard, Déposer, Profil**.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-NAV-03 — Pages réservées : redirection vers la connexion

- **Objectif** : les pages réservées renvoient vers la connexion quand on n'est pas connecté.
- **Prérequis** : être déconnecté.
- **Étapes** : ouvrir successivement `/messages`, `/dashboard`, `/spaces/new`, `/stripe/connect`, `/api/stripe/dashboard`.
- **Résultat attendu** : chaque adresse redirige vers `https://www.nestock.pro/login` (pour `/api/stripe/dashboard` : `/login?raison=stripe&next=/api/stripe/dashboard`), sans afficher le contenu de la page (en particulier, aucun formulaire « Déposer » visible).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Dashboard

### T-DASH-01 — Le Dashboard affiche le tableau de bord, pas la carte

- **Objectif** : vérifier la restauration du vrai tableau de bord (écrasé par la page d'accueil le 10/08/2026).
- **Prérequis** : compte de test connecté ayant au moins une annonce ou une location.
- **Étapes** :
  1. Cliquer sur **Dashboard** dans le menu.
  2. Parcourir la page.
- **Résultat attendu** : sections de locations et d'annonces avec statuts, boutons (quittances, préavis, suppression d'annonce…) ; **aucune carte** ni liste « espaces trouvés ».
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Carte

### T-MAP-01 — Carte de la page d'accueil : défilement, zoom, déplacement

- **Objectif** : la molette fait défiler la page sans zoomer la carte, mais le zoom reste possible.
- **Prérequis** : être déconnecté (la carte de la page d'accueil n'est affichée qu'aux visiteurs).
- **Étapes** :
  1. Placer la souris sur la carte « Espaces disponibles près de chez vous » et tourner la molette.
  2. Maintenir **Ctrl** (Windows) ou **⌘** (Mac) et tourner la molette.
  3. Cliquer sur les boutons **+** / **−** en haut à droite de la carte.
  4. Cliquer-glisser la carte de droite à gauche.
  5. Sur mobile : glisser un doigt sur la carte, puis deux doigts.
- **Résultat attendu** :
  1. La page défile, la carte ne zoome pas ; un message « Maintenez Ctrl + molette pour zoomer sur la carte » (ou ⌘) s'affiche.
  2. La carte zoome.
  3. La carte zoome / dézoome.
  4. La carte se déplace.
  5. Un doigt fait défiler la page (message « Utilisez deux doigts pour déplacer la carte ») ; deux doigts déplacent la carte.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Page d'accueil

### T-LAND-01 — Contenu de la page d'accueil

- **Objectif** : la page d'accueil visiteur correspond à la refonte du 05/10/2026.
- **Prérequis** : être déconnecté.
- **Étapes** : parcourir https://www.nestock.pro de haut en bas.
- **Résultat attendu** :
  - La phrase « L'Airbnb du stockage entre particuliers » n'apparaît nulle part (page d'accueil, À propos, Contact, pieds de page).
  - Ordre des sections : présentation → carte → **Notre vision** → Comment louer un espace ? → **Une plateforme complète** → Pour les propriétaires → Stripe → FAQ → Prêt à commencer ?
  - **Notre vision** : 4 cartes (Proximité, Confiance, Accessibilité, Impact local) sur 2 colonnes (1 sur mobile), texte entièrement blanc et lisible.
  - Absence des sections de chiffres (« 100 % », « 0 euro », « 15j ») et « Pourquoi choisir Nestock ? ».
  - Section Stripe : la première carte s'intitule **« Certification »** ; bloc « Propriétaire sur Nestock ? » avec le bouton « Accéder à mon compte Stripe ».
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-LAND-02 — Lien Stripe Climate

- **Objectif** : l'engagement climat est visible et le lien fonctionne.
- **Prérequis** : aucun.
- **Étapes** :
  1. Sur la page d'accueil (déconnecté), repérer le badge vert en haut de la première section et cliquer dessus.
  2. Vérifier le pied de page de la page d'accueil, d'À propos et de Contact.
- **Résultat attendu** : badge « 1 % de nos revenus finance l'élimination du CO₂ (Stripe Climate) » en haut de page ; même lien avec une feuille verte dans chaque pied de page ; le clic ouvre https://climate.stripe.com/ShwhDB (page d'engagement de Tsukee).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Modèle de test

```markdown
### T-CATEGORIE-NN — Titre court

- **Objectif** : ce que le test doit prouver.
- **Prérequis** : compte, données ou état nécessaires (ou « aucun »).
- **Étapes** :
  1. …
- **Résultat attendu** : ce qu'on doit voir, avec les URL exactes si possible.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|
```
