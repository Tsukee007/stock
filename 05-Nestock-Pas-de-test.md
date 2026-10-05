# Nestock — Pas de test

Cahier de tests destiné à des agents IA (et à un humain si besoin). Chaque test décrit **quoi faire** et **ce qu'on doit obtenir** ; l'agent qui l'exécute **ajoute son retour** dans l'historique du test.

---

## Consignes pour les agents

1. **Environnement** : site de production https://www.nestock.pro, Stripe en **mode test uniquement**. Ne jamais saisir de vraie carte, de vrai IBAN ni de vraie pièce d'identité.
2. **Comptes** : utiliser uniquement des comptes de test (`…+test@…`). Ne jamais modifier ni supprimer les annonces/locations d'un autre utilisateur. Les tests désignent trois comptes de test distincts :
   - **Propriétaire** : publie les annonces (compte Stripe complet, voir T-STRIPE-01)
   - **Locataire** : réserve et paie
   - **3e compte** : sans lien avec les deux autres (tests d'accès interdit)
3. **Données de test Stripe** :
   - Carte : `4242 4242 4242 4242`, date future quelconque, CVC quelconque
   - IBAN : `FR1420041010050500013M02606`
   - Code de vérification SMS / identité : `000000`
4. **Choisir un test** : prendre un test dont le statut courant est `À faire` ou `Échec` (re-test après correction). Respecter les `Prérequis` : certains tests s'enchaînent (ex. T-STRIPE-01 → T-ANN-01 → T-RESA-01 → T-RESA-03 → T-PAY-01 → T-RESIL-01). Si un prérequis n'est pas rempli, statut `Bloqué` en citant le test manquant. La ligne **Source** indique le document d'où vient le comportement attendu.
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
| T-AUTH-01 | Inscription d'un nouveau compte | À faire |
| T-AUTH-02 | Erreurs de connexion | À faire |
| T-AUTH-03 | Mot de passe oublié de bout en bout | À faire |
| T-AUTH-04 | Modification du profil et déconnexion | À faire |
| T-ANN-01 | Création d'une annonce avec photos | À faire |
| T-ANN-02 | Limites des photos | À faire |
| T-ANN-03 | Modification d'une annonce | À faire |
| T-ANN-04 | Suppression protégée d'une annonce | À faire |
| T-ANN-05 | Le propriétaire ne peut pas réserver sa propre annonce | À faire |
| T-RECH-01 | Recherche par ville et filtres | À faire |
| T-RECH-02 | Liste et carte sur mobile | À faire |
| T-RESA-01 | Demande de réservation | À faire |
| T-RESA-02 | Refus d'une demande | À faire |
| T-RESA-03 | Acceptation, contrat et signatures | À faire |
| T-RESA-04 | Signature bloquée si profil incomplet | À faire |
| T-RESA-05 | Annonce louée non réservable | À faire |
| T-PAY-01 | Premier paiement et quittance | À faire |
| T-PAY-02 | Webhook Stripe accessible et protégé | Partiel |
| T-PAY-03 | Gestion du paiement côté locataire | À faire |
| T-RESIL-01 | Préavis de 15 jours | À faire |
| T-RESIL-02 | Cycle complet facturation → préavis → remboursement | À faire |
| T-RESIL-03 | Tâche de clôture protégée | À faire |
| T-MSG-01 | Messagerie en temps réel | À faire |
| T-NOTIF-01 | Cloche de notifications | À faire |
| T-AVIS-01 | Avis en fin de location | À faire |
| T-SEC-01 | Données d'autrui inaccessibles | À faire |
| T-SEC-02 | Panels d'administration protégés | À faire |
| T-LEGAL-01 | Pages légales et RGPD | À faire |
| T-UI-01 | Orthographe, ton et marque | À faire |

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

## Authentification & profil

### T-AUTH-01 — Inscription d'un nouveau compte

- **Objectif** : un visiteur peut créer un compte avec ses coordonnées complètes.
- **Source** : 02-Nestock-Fonctionnalites.md §2.1, 01-Nestock-context.md (inscription avec adresse)
- **Prérequis** : aucun (adresse e-mail de test jamais utilisée).
- **Étapes** :
  1. Ouvrir https://www.nestock.pro/register.
  2. Remplir tous les champs (nom, e-mail, mot de passe, téléphone, adresse, code postal, ville) et valider.
  3. Suivre l'éventuel e-mail de confirmation, puis se connecter.
  4. Ouvrir /profile.
- **Résultat attendu** :
  - Fond de page avec la photo du garage et formulaire lisible.
  - Compte créé, connexion possible.
  - /profile affiche toutes les informations saisies.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-AUTH-02 — Erreurs de connexion

- **Objectif** : les erreurs de connexion sont signalées clairement, sans plantage.
- **Source** : 02-Nestock-Fonctionnalites.md §2.1
- **Prérequis** : être déconnecté.
- **Étapes** :
  1. Sur /login, se connecter avec un e-mail inexistant.
  2. Se connecter avec un e-mail valide et un mauvais mot de passe.
  3. Cliquer sur « Se connecter » avec les champs vides.
- **Résultat attendu** :
  - Un message d'erreur s'affiche à chaque fois, l'utilisateur reste sur /login.
  - Signaler en observation si le message est en anglais (ex. « Invalid login credentials »).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-AUTH-03 — Mot de passe oublié de bout en bout

- **Objectif** : le lien de réinitialisation reçu par e-mail fonctionne.
- **Source** : 01-Nestock-context.md (bug 11/05 « Lien reset password invalide »)
- **Prérequis** : compte de test avec accès à sa boîte mail.
- **Étapes** :
  1. Sur /login, cliquer « Mot de passe oublié ? », saisir l'e-mail du compte de test.
  2. Ouvrir l'e-mail reçu et cliquer sur le lien.
  3. Saisir un nouveau mot de passe, valider.
  4. Se connecter avec le nouveau mot de passe.
- **Résultat attendu** :
  - E-mail reçu en quelques minutes.
  - Le lien ouvre https://www.nestock.pro/reset-password (pas une erreur, pas l'ancien domaine nestock.tsukee.fr, pas localhost).
  - Connexion réussie avec le nouveau mot de passe.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-AUTH-04 — Modification du profil et déconnexion

- **Objectif** : un utilisateur peut modifier ses informations et se déconnecter proprement.
- **Source** : 02-Nestock-Fonctionnalites.md §2.1, 01-Nestock-context.md (page profil)
- **Prérequis** : compte de test connecté.
- **Étapes** :
  1. Ouvrir /profile, modifier le téléphone et la ville, enregistrer.
  2. Recharger la page.
  3. Cliquer sur « Déconnexion ».
  4. Ouvrir /dashboard.
- **Résultat attendu** :
  - Modifications conservées après rechargement.
  - Après déconnexion : retour sur la page d'accueil de nestock.pro, menu visiteur.
  - /dashboard redirige vers /login.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Annonces

### T-ANN-01 — Création d'une annonce avec photos

- **Objectif** : un propriétaire publie une annonce complète, visible sur la carte.
- **Source** : 02-Nestock-Fonctionnalites.md §2.2
- **Prérequis** : compte Propriétaire connecté avec compte Stripe complet (T-STRIPE-01 OK).
- **Étapes** :
  1. Menu « Déposer ».
  2. Remplir titre, description, type, surface, prix mensuel et adresse (choisir une suggestion).
  3. Ajouter 3 photos de moins de 2 Mo.
  4. Publier.
  5. Se déconnecter et chercher la ville de l'annonce sur la carte de la page d'accueil.
- **Résultat attendu** :
  - Le simulateur affiche : prix fixé + commission 10 % + frais Stripe = prix payé par le locataire ; le propriétaire reçoit son prix.
  - Annonce publiée, page détail avec les 3 photos (agrandissables en plein écran).
  - Marqueur de prix TTC (2 décimales) visible sur la carte, badge « A louer ».
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-ANN-02 — Limites des photos

- **Objectif** : les limites de photos (3 maximum, 2 Mo) sont appliquées avec un message clair.
- **Source** : 02-Nestock-Fonctionnalites.md §2.2
- **Prérequis** : compte Propriétaire connecté.
- **Étapes** :
  1. Dans « Déposer », tenter d'ajouter une 4e photo.
  2. Tenter d'ajouter une photo de plus de 2 Mo.
- **Résultat attendu** :
  - 4e photo refusée.
  - Photo trop lourde refusée avec un message compréhensible, sans plantage de la page.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-ANN-03 — Modification d'une annonce

- **Objectif** : un propriétaire modifie son annonce et les changements sont visibles partout.
- **Source** : 02-Nestock-Fonctionnalites.md §2.2
- **Prérequis** : annonce du T-ANN-01.
- **Étapes** :
  1. Depuis le Dashboard ou la page de l'annonce, ouvrir la modification.
  2. Changer le prix et la description, enregistrer.
  3. Consulter la page détail et la carte de la page d'accueil.
- **Résultat attendu** :
  - Nouveau prix et nouvelle description affichés sur la page détail, la liste et le marqueur de la carte (prix TTC recalculé).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-ANN-04 — Suppression protégée d'une annonce

- **Objectif** : une annonce avec location en cours ne peut pas être supprimée ; une annonce libre oui.
- **Source** : 02-Nestock-Fonctionnalites.md §2.2
- **Prérequis** : une annonce avec location active (T-RESA-03 OK) et une annonce sans location.
- **Étapes** :
  1. Tenter de supprimer l'annonce louée.
  2. Supprimer l'annonce libre.
- **Résultat attendu** :
  - Suppression de l'annonce louée refusée avec explication.
  - Annonce libre supprimée, disparue de la carte.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-ANN-05 — Le propriétaire ne peut pas réserver sa propre annonce

- **Objectif** : le bouton de réservation est masqué pour le propriétaire de l'annonce.
- **Source** : 01-Nestock-context.md (bug 11/05 « masquer bouton réservation pour le propriétaire »)
- **Prérequis** : compte Propriétaire connecté, annonce du T-ANN-01.
- **Étapes** :
  1. Ouvrir la page détail de sa propre annonce.
- **Résultat attendu** :
  - Pas de bouton de réservation (ou bouton désactivé avec explication).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Recherche & carte

### T-RECH-01 — Recherche par ville et filtres

- **Objectif** : la recherche et les filtres renvoient les bons espaces.
- **Source** : 02-Nestock-Fonctionnalites.md §2.3
- **Prérequis** : au moins 2 annonces de types et prix différents.
- **Étapes** :
  1. Sur la carte (connecté), rechercher une ville où existe une annonce.
  2. Ouvrir « Filtres » : filtrer par type, puis par fourchette de prix, puis par surface minimale.
  3. Utiliser le filtre de rayon de distance.
  4. Rechercher une ville sans annonce.
- **Résultat attendu** :
  - La liste et les marqueurs correspondent aux filtres ; le compteur « N espaces trouvés » est juste.
  - Ville sans annonce : message « Aucun résultat », pas d'erreur.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RECH-02 — Liste et carte sur mobile

- **Objectif** : la bascule Liste / Carte fonctionne sur mobile.
- **Source** : 02-Nestock-Fonctionnalites.md §2.3
- **Prérequis** : téléphone ou fenêtre de 390 px.
- **Étapes** :
  1. Ouvrir la page d'accueil.
  2. Basculer entre les onglets « Liste » et « Carte ».
  3. Toucher un marqueur, puis « Voir l'annonce ».
- **Résultat attendu** :
  - Chaque onglet affiche son contenu sans débordement horizontal.
  - Le marqueur ouvre une bulle (titre, statut, ville, surface, prix) et le lien mène à l'annonce.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Réservation & contrat

### T-RESA-01 — Demande de réservation

- **Objectif** : un locataire envoie une demande, le propriétaire est prévenu.
- **Source** : 02-Nestock-Fonctionnalites.md §2.5, 01-Nestock-context.md (bug 11/05 « page reste figée » ; « message d'erreur clair pour réservation en doublon »)
- **Prérequis** : compte Locataire connecté (profil complet), annonce libre d'un autre compte (Propriétaire).
- **Étapes** :
  1. Ouvrir l'annonce, cliquer sur le bouton de réservation.
  2. Choisir une date de début, envoyer.
  3. Envoyer une seconde demande sur la même annonce.
  4. Se connecter en Propriétaire.
- **Résultat attendu** :
  - Après envoi : redirection (messagerie ou page de suivi), la page ne reste pas figée.
  - Seconde demande : message d'erreur clair (doublon).
  - Propriétaire : notification (cloche) + e-mail ; demande visible dans le Dashboard, section des demandes.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESA-02 — Refus d'une demande

- **Objectif** : le propriétaire peut refuser une demande et le locataire est prévenu.
- **Source** : 02-Nestock-Fonctionnalites.md §2.5
- **Prérequis** : une demande en attente (T-RESA-01).
- **Étapes** :
  1. En Propriétaire, refuser la demande depuis le Dashboard.
  2. Se connecter en Locataire.
- **Résultat attendu** :
  - Statut « annulée » (ou équivalent) des deux côtés.
  - Locataire notifié ; l'annonce reste disponible.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESA-03 — Acceptation, contrat et signatures

- **Objectif** : le contrat est généré, signé par les deux parties, puis la location devient payable.
- **Source** : 02-Nestock-Fonctionnalites.md §2.5, 01-Nestock-context.md (bugs 11/05 « adresse complète article 1 », « redirection après signature »)
- **Prérequis** : une demande en attente.
- **Étapes** :
  1. En Propriétaire, accepter la demande.
  2. Ouvrir le contrat, vérifier son contenu, signer.
  3. En Locataire, ouvrir le contrat et signer.
- **Résultat attendu** :
  - Contrat avec référence NST-CTR-AAAA-XXXXX, nom de l'annonce dans l'en-tête, adresse complète du local à l'article 1, identités et e-mails des deux parties.
  - Après signature du propriétaire : redirection vers le Dashboard.
  - Statuts successifs : en attente de signature → confirmée ; notifications à chaque étape.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESA-04 — Signature bloquée si profil incomplet

- **Objectif** : impossible de signer un contrat sans profil complet.
- **Source** : 02-Nestock-Fonctionnalites.md §2.1, 01-Nestock-context.md
- **Prérequis** : compte Locataire dont on vide le téléphone dans /profile, contrat en attente de sa signature.
- **Étapes** :
  1. Ouvrir le contrat.
  2. Compléter le profil, revenir au contrat.
- **Résultat attendu** :
  - Encadré « ⚠️ Profil incomplet » et bouton de signature désactivé.
  - Après complétion : bouton actif.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESA-05 — Annonce louée non réservable

- **Objectif** : une annonce déjà louée ne peut pas être réservée par un autre locataire.
- **Source** : 01-Nestock-context.md (« Annonce active bloquée à la réservation », « Annonce en préavis : affiche date de disponibilité »)
- **Prérequis** : annonce avec location confirmée ou active, un 3e compte de test.
- **Étapes** :
  1. Avec le 3e compte, ouvrir l'annonce.
- **Résultat attendu** :
  - Badge « En location » ; réservation impossible (ou date de disponibilité affichée si la location est en préavis : « ⏳ Disponible le … »).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Paiement & quittances

### T-PAY-01 — Premier paiement et quittance

- **Objectif** : le locataire paie, la location devient active, les deux parties reçoivent la quittance.
- **Source** : 02-Nestock-Fonctionnalites.md §2.6–2.7
- **Prérequis** : contrat signé par les deux parties (T-RESA-03).
- **Étapes** :
  1. En Locataire, lancer le paiement, payer avec la carte de test 4242 4242 4242 4242.
  2. Consulter le Dashboard des deux comptes et la page détail de la location.
  3. Ouvrir la quittance, cliquer sur imprimer.
  4. Dans Stripe (mode test) : Paiements, et Connect → compte du propriétaire.
- **Résultat attendu** :
  - Montant payé = prix TTC de l'annonce (2 décimales).
  - Statut « Location active » ; quittance NST-FAC-AAAA-XXXXX consultable, imprimable, reçue par e-mail par les deux parties.
  - Stripe : commission de 10 % prélevée, le reste transféré au compte connecté du propriétaire.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-PAY-02 — Webhook Stripe accessible et protégé

- **Objectif** : l'adresse du webhook Stripe n'est jamais redirigée (bug de juillet 2026 qui cassait tous les paiements en silence) et refuse tout message non signé par Stripe.
- **Source** : 01-Nestock-context.md (bug webhook 20/07/2026), 02-Nestock-Fonctionnalites.md §2.6
- **Prérequis** : aucun.
- **Étapes** :
  1. Exécuter `curl -s -w '\n%{http_code} %{redirect_url}\n' -X POST https://www.nestock.pro/api/stripe/webhook -H 'stripe-signature: invalide' -H 'Content-Type: application/json' -d '{}'` (corps vide : ne modifie aucune donnée). **Ne jamais envoyer un faux événement avec un contenu réel.**
  2. Dans Stripe (mode test) → Développeurs → Webhooks → endpoint nestock.pro → tentatives récentes.
- **Résultat attendu** :
  - Étape 1 : code **400** (signature invalide), sans URL de redirection — jamais 307/308, jamais 200.
  - Étape 2 : les dernières tentatives réelles sont en 200.
- **Statut courant** : Partiel

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-05 | Claude Code | Échec | Pas de redirection (OK), mais réponse `200 {"received":true}` à un message signé « invalide ». `app/api/stripe/webhook/route.ts` : en cas d'échec de `constructEvent`, le code fait `event = JSON.parse(body)` et traite l'événement quand même → n'importe qui peut forger un événement Stripe (`checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`…). Sans corps, réponse 500. Étape 2 non faite (pas d'accès au tableau de bord Stripe). |
| 2026-10-05 | Claude Code | Partiel | Après correction (rejet des événements non signés) : étape 1 → `400`, sans redirection ; sans en-tête de signature → `400`. Étape 2 à faire : vérifier dans Stripe que les vrais événements arrivent toujours en 200 (sinon `STRIPE_WEBHOOK_SECRET` sur Vercel `stock-kb8s` ne correspond pas à la clé `whsec_` de l'endpoint de test). |

### T-PAY-03 — Gestion du paiement côté locataire

- **Objectif** : le locataire accède au portail Stripe pour gérer son moyen de paiement.
- **Source** : 02-Nestock-Fonctionnalites.md §2.6
- **Prérequis** : compte Locataire avec location active (T-PAY-01).
- **Étapes** :
  1. Ouvrir /profile, cliquer sur le lien de gestion du paiement.
  2. Revenir sur Nestock depuis le portail.
- **Résultat attendu** :
  - Ouverture du portail de facturation Stripe (mode test).
  - Le retour mène à https://www.nestock.pro/profile (ou nestock.pro/profile), toujours connecté.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Résiliation

### T-RESIL-01 — Préavis de 15 jours

- **Objectif** : le préavis démarre, s'affiche des deux côtés et programme la fin du prélèvement Stripe.
- **Source** : 02-Nestock-Fonctionnalites.md §2.8
- **Prérequis** : location active (T-PAY-01).
- **Étapes** :
  1. En Locataire, cliquer « Résilier » depuis le Dashboard ou la page détail.
  2. Consulter le Dashboard des deux comptes.
  3. En Propriétaire, cliquer sur l'accusé de réception du préavis.
  4. Dans Stripe (mode test), ouvrir l'abonnement.
- **Résultat attendu** :
  - Statut « en préavis » avec compte à rebours de 15 jours des deux côtés ; notification + e-mail à l'autre partie.
  - Accusé de réception enregistré et visible.
  - Abonnement Stripe : « Cancels on [date de fin] ».
  - L'annonce affiche « ⏳ Disponible le [date de fin] ».
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESIL-02 — Cycle complet facturation → préavis → remboursement

- **Objectif** : valider annulation programmée, remboursement au prorata et clôture par le cron, sans attendre 15 jours.
- **Source** : 03-Nestock-test-stripe-clock-scenario.md
- **Prérequis** : accès au tableau de bord Stripe (mode test) et à Supabase ; CRON_SECRET.
- **Étapes** :
  1. Dérouler intégralement le protocole de `03-Nestock-test-stripe-clock-scenario.md` (étapes 1 à 5, puis nettoyage).
  2. Reporter dans les observations le résultat de chaque bloc « ✅ Vérifications ».
- **Résultat attendu** :
  - Toutes les vérifications du document 03 sont validées (invoice.paid en 200, cancel_at programmé, remboursement au prorata si prélèvement pendant le préavis, cron processed ≥ 1, statut ended, annonce de nouveau disponible).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESIL-03 — Tâche de clôture protégée

- **Objectif** : la tâche automatique de fin de location ne peut pas être déclenchée par n'importe qui.
- **Source** : 01-Nestock-context.md (CRON_SECRET), 02-Nestock-Fonctionnalites.md §2.8
- **Prérequis** : aucun.
- **Étapes** :
  1. Exécuter `curl -s -o /dev/null -w '%{http_code}' https://www.nestock.pro/api/cron/end-bookings` (sans secret).
  2. Même commande avec un faux secret : `-H 'Authorization: Bearer faux'`.
- **Résultat attendu** :
  - Les deux appels sont refusés (401 ou 403), aucune location modifiée.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Messagerie, notifications & avis

### T-MSG-01 — Messagerie en temps réel

- **Objectif** : propriétaire et locataire échangent des messages sans recharger la page.
- **Source** : 02-Nestock-Fonctionnalites.md §2.4
- **Prérequis** : une réservation entre les comptes Locataire et Propriétaire ; deux navigateurs (ou une fenêtre privée).
- **Étapes** :
  1. Ouvrir /messages avec les deux comptes, sur la même conversation.
  2. Envoyer un message depuis chaque compte.
  3. Refaire l'essai sur mobile (390 px).
- **Résultat attendu** :
  - Chaque message apparaît chez l'autre sans rechargement ; notification (cloche) et e-mail reçus.
  - Sur mobile, liste des conversations et conversation utilisables, sans débordement.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-NOTIF-01 — Cloche de notifications

- **Objectif** : chaque événement important crée une notification lisible.
- **Source** : 02-Nestock-Fonctionnalites.md §2.9
- **Prérequis** : avoir déroulé T-RESA-01 et T-RESA-03.
- **Étapes** :
  1. Cliquer sur la cloche du compte Propriétaire, puis du compte Locataire.
  2. Cliquer sur une notification.
- **Résultat attendu** :
  - Badge avec le nombre de non-lues ; une notification par événement (demande, acceptation, signature, paiement…), en français.
  - Le clic mène à l'élément concerné et la notification passe en lue.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-AVIS-01 — Avis en fin de location

- **Objectif** : le locataire peut laisser un avis étoilé une fois la location terminée.
- **Source** : 02-Nestock-Fonctionnalites.md §2.10
- **Prérequis** : location terminée (T-RESIL-02 OK).
- **Étapes** :
  1. En Locataire, ouvrir le Dashboard, location terminée.
  2. Laisser 4 étoiles et un commentaire.
  3. Ouvrir la page de l'annonce.
- **Résultat attendu** :
  - Formulaire d'avis disponible uniquement pour une location terminée ; un seul avis possible.
  - Avis visible sur la page de l'annonce.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

---

## Sécurité, administration & légal

### T-SEC-01 — Données d'autrui inaccessibles

- **Objectif** : un utilisateur ne peut pas voir le contrat, la location ou la quittance d'un autre.
- **Source** : 02-Nestock-Fonctionnalites.md §2.5–2.7
- **Prérequis** : identifiants (bookingId, invoiceId) d'une location entre Locataire et Propriétaire ; un 3e compte de test.
- **Étapes** :
  1. Avec le 3e compte, ouvrir /contracts/[bookingId], /dashboard/bookings/[bookingId], puis /dashboard/bookings/[bookingId]/invoice/[invoiceId].
- **Résultat attendu** :
  - Accès refusé ou redirection sur les trois pages : aucune donnée personnelle (nom, adresse, e-mail, montant) affichée.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-SEC-02 — Panels d'administration protégés

- **Objectif** : les panels admin exigent le mot de passe administrateur.
- **Source** : 02-Nestock-Fonctionnalites.md §2.12
- **Prérequis** : aucun (ne pas utiliser le vrai mot de passe admin).
- **Étapes** :
  1. Ouvrir /admin-waitlist et /admin-calendar en navigation privée.
  2. Saisir un mauvais mot de passe.
- **Résultat attendu** :
  - Aucune donnée affichée avant authentification ; mauvais mot de passe refusé.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-LEGAL-01 — Pages légales et RGPD

- **Objectif** : les pages légales sont accessibles et les formulaires portent la mention RGPD.
- **Source** : 02-Nestock-Fonctionnalites.md §2.14, 01-Nestock-context.md (waitlist désactivée)
- **Prérequis** : aucun.
- **Étapes** :
  1. Ouvrir /cgu et /confidentialite depuis le pied de page.
  2. Ouvrir /register et /contact, chercher la mention RGPD.
  3. Ouvrir /waitlist.
- **Résultat attendu** :
  - CGU et Confidentialité s'affichent, contact contact@nestock.pro présent.
  - Mention RGPD sur les formulaires de collecte.
  - /waitlist redirige vers la page d'accueil.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-UI-01 — Orthographe, ton et marque

- **Objectif** : les textes respectent l'identité de marque.
- **Source** : 04-Nestock-Identite-Visuelle.md (ton de voix), 01-Nestock-context.md (audit accents, incident logo Stripe)
- **Prérequis** : aucun.
- **Étapes** :
  1. Parcourir accueil, À propos, Contact, inscription, connexion, Dashboard, contrat, quittance, messagerie.
- **Résultat attendu** :
  - Vouvoiement partout, accents présents (relever chaque faute avec la page et la phrase exacte).
  - Aucune garantie de sécurité attribuée à Nestock au lieu de Stripe (ex. « Nestock certifié PCI-DSS »).
  - Le mot « Stripe » s'affiche correctement (incident « gripe » du 10/08).
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
