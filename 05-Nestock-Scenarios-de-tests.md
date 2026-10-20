# Nestock — Scénarios de tests

Cahier de tests destiné à des agents IA (et à un humain si besoin). Chaque test décrit **quoi faire** et **ce qu'on doit obtenir** ; l'agent qui l'exécute **ajoute son retour** dans l'historique du test.

Le protocole détaillé du cycle prélèvement → préavis → fin de location (Stripe Test Clocks) est en [annexe](#annexe--protocole-stripe-test-clocks) ; il est exécuté par le test T-RESIL-02.

**Règle de mise à jour (19/10/2026)** : chaque bug corrigé, chaque évolution et chaque nouveau paramétrage reçoit un test dans ce cahier (ligne **Source** = date et origine). Un bug corrigé garde son test pour être re-testé.

---

## Consignes pour les agents

1. **Environnement** : site de production https://www.nestock.pro, Stripe en **mode test uniquement**. Ne jamais saisir de vraie carte, de vrai IBAN ni de vraie pièce d'identité. Les tests qui passent par un paiement ont besoin du webhook Stripe en mode test vers www.nestock.pro (absent au 19/10/2026) : sans lui, la location ne s'active pas après paiement ; marquer alors `Bloqué` en citant ce prérequis.
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
| T-STRIPE-06 | Connexion normale non perturbée (retour après connexion sécurisé) | Bloqué |
| T-STRIPE-07 | Propriétaire sans compte Stripe actif : demande possible, relances envoyées | À faire |
| T-STRIPE-08 | Signature, acceptation et paiement bloqués tant que le compte Stripe n'est pas actif | À faire |
| T-STRIPE-09 | Pas de faux « Compte Stripe connecté ! » si l'inscription est quittée | À faire |
| T-NAV-01 | Menu visiteur non connecté | Partiel |
| T-NAV-02 | Menu utilisateur connecté | Bloqué |
| T-NAV-03 | Pages réservées : redirection vers la connexion | OK |
| T-DASH-01 | Le Dashboard affiche le tableau de bord, pas la carte | Bloqué |
| T-MAP-01 | Carte de la page d'accueil : défilement, zoom, déplacement | À faire |
| T-LAND-01 | Contenu de la page d'accueil | À faire |
| T-LAND-02 | Lien Stripe Climate (haut de page + pieds de page) | À faire |
| T-AUTH-01 | Inscription d'un nouveau compte | À faire |
| T-AUTH-02 | Erreurs de connexion | OK |
| T-AUTH-03 | Mot de passe oublié de bout en bout (utilisateur et admin) | À faire |
| T-AUTH-04 | Modification du profil et déconnexion | À faire |
| T-AUTH-05 | Connexion réussie : utilisateur et admin | À faire |
| T-AUTH-06 | Réinitialisation du mot de passe : cas d'erreur | À faire |
| T-AUTH-07 | E-mail de confirmation d'inscription aux couleurs de Nestock | À faire |
| T-AUTH-08 | E-mail de réinitialisation du mot de passe aux couleurs de Nestock | Partiel |
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
| T-PAY-04 | Prélèvement le 1er du mois, 1er paiement au prorata | À faire |
| T-PAY-05 | Reversement au propriétaire : 1er mois partiel puis mois entiers | À faire |
| T-PAY-06 | Reprendre un paiement abandonné (bouton « Payer ») | À faire |
| T-RESIL-01 | Préavis : affichage des deux côtés et accusé de réception | À faire |
| T-RESIL-02 | Cycle complet : prélèvement le 1er → préavis → fin sans remboursement | À faire |
| T-RESIL-03 | Tâche de clôture protégée | OK |
| T-RESIL-04 | Fin de location toujours en fin de mois (règle du 15) | À faire |
| T-RESIL-05 | Le locataire peut résilier (re-test du bug du 19/10/2026) | À faire |
| T-RESIL-06 | Aucun remboursement ni reprise à la fin de la location | À faire |
| T-RESIL-07 | Actions impossibles à la mauvaise étape de la location | À faire |
| T-RESIL-08 | Annulation de l'abonnement directement chez Stripe | À faire |
| T-PROD-01 | Passage de Stripe en mode live | À faire |
| T-MSG-01 | Messagerie en temps réel | À faire |
| T-NOTIF-01 | Cloche de notifications | À faire |
| T-AVIS-01 | Avis en fin de location | À faire |
| T-SEC-01 | Données d'autrui inaccessibles | À faire |
| T-SEC-02 | Panels d'administration protégés | À faire |
| T-SEC-03 | Comptes non admin : aucun accès à l'administration | À faire |
| T-SEC-04 | Un locataire ne peut pas signer à la place du propriétaire | À faire |
| T-SEC-05 | Statuts et paiement réservés aux bonnes personnes | À faire |
| T-SEC-06 | Tâche de clôture : « Bearer undefined » refusé | À faire |
| T-SEC-07 | Réservations non lisibles avec la clé publique | À faire |
| T-SEC-08 | Anciennes adresses qui créaient une réservation : supprimées | À faire |
| T-ADMIN-01 | Dossier de preuves d'une location | À faire |
| T-LEGAL-01 | Pages légales et RGPD | OK |
| T-LEGAL-02 | CGU obligatoires à l'inscription et enregistrées | À faire |
| T-LEGAL-03 | CGU et contrat à jour (version du 19/10/2026) | À faire |
| T-UI-01 | Orthographe, ton et marque | À faire |
| T-MAIL-01 | Un e-mail qui ne part pas ne bloque pas l'action | À faire |
| T-MAIL-02 | Formulaire de contact : texte saisi affiché tel quel | À faire |
| T-CONF-01 | Paramétrage de la production (Vercel, Stripe) | À faire |

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
| 2026-10-06 | Testeur (AI Framework) | OK | Re-test : `/api/logout` → 307 vers `https://nestock.pro/` (pas `nestock.tsukee.fr`), conforme au résultat attendu (domaine accepté, chaîne de redirection vers www déjà validée précédemment). |

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
- **Statut courant** : Bloqué

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-08 | Testeur (AI Framework) | Bloqué | Étape 1 : connexion avec le compte Propriétaire sur /login échoue (Invalid login credentials). Même échec avec les comptes Locataire et 3e compte. Étapes 2 et 3 non réalisables faute de connexion réussie. |

### T-STRIPE-07 — Propriétaire sans compte Stripe actif : demande possible, relances envoyées

- **Objectif** : un locataire peut demander une annonce dont le propriétaire n'a pas fini son inscription Stripe ; le propriétaire est relancé, le locataire prévenu.
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026) ; évolution « location seulement si le compte Stripe du propriétaire est actif »
- **Prérequis** : un 3e compte utilisé comme propriétaire **sans** compte Stripe terminé, avec une annonce visible ; compte Locataire. Lire les boîtes mail des deux comptes.
- **Étapes** :
  1. En Locataire, ouvrir l'annonce du 3e compte.
  2. Cliquer « Faire une demande de réservation », choisir une date, envoyer.
  3. Ouvrir la cloche de notifications du Locataire.
  4. Lire la boîte mail du 3e compte et ses notifications.
  5. En 3e compte, ouvrir sa propre annonce puis son Dashboard.
- **Résultat attendu** :
  - Étape 1 : sous le bouton, message jaune « Le propriétaire finalise son compte de paiement. Vous pouvez déjà envoyer votre demande… ».
  - Étape 2 : la demande est créée (redirection vers la messagerie).
  - Étape 3 : notification « Demande envoyée » : le propriétaire doit finaliser son compte de paiement.
  - Étape 4 : deux e-mails au 3e compte, « Nouvelle demande de reservation » et « Action requise : finalisez votre compte Stripe pour accepter la demande » (bouton vers /stripe/connect) ; notification « Finalisez votre compte Stripe ».
  - Étape 5 : bandeau jaune « Finalisez votre compte Stripe » sur l'annonce (sans bouton de demande) et « Finalisez votre compte Stripe pour accepter ces demandes » au-dessus des demandes du Dashboard.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-STRIPE-08 — Signature, acceptation et paiement bloqués tant que le compte Stripe n'est pas actif

- **Objectif** : aucune location ne peut démarrer si le propriétaire ne peut pas recevoir ses loyers (évite les alertes « reversement en échec »).
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026)
- **Prérequis** : T-STRIPE-07 fait (demande en attente chez le 3e compte, toujours sans Stripe).
- **Étapes** :
  1. En 3e compte, Dashboard → « Accepter et signer » sur la demande ; remplir et valider la signature.
  2. En Locataire, ouvrir /contracts/[id de la réservation].
  3. En 3e compte, refuser la demande.
- **Résultat attendu** :
  - Étape 1 : bandeau « Finalisez votre compte Stripe » sur la page du contrat ; la signature est refusée avec « Finalisez votre inscription Stripe avant de signer… » ; le contrat reste non signé.
  - Étape 2 : bandeau « Le propriétaire finalise son compte de paiement » ; aucune signature ni paiement possible.
  - Étape 3 : le refus fonctionne (statut « Refusée »).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-STRIPE-09 — Pas de faux « Compte Stripe connecté ! » si l'inscription est quittée

- **Objectif** : la page de retour de Stripe n'annonce le succès que si le compte est vraiment prêt.
- **Source** : bug relevé le 15/10/2026 (inscription quittée sans « Accepter et envoyer »), corrigé le 19/10/2026
- **Prérequis** : un compte sans compte Stripe terminé.
- **Étapes** :
  1. Aller sur /stripe/connect, lancer l'inscription Stripe, puis la quitter sans valider le récapitulatif (bouton retour ou croix de Stripe).
  2. Observer la page de retour sur nestock.pro.
  3. Reprendre l'inscription jusqu'au bout avec « Accepter et envoyer » (données de test de la consigne 3).
- **Résultat attendu** :
  - Étape 2 : adresse `…/stripe/connect?success=true`, mais la page affiche « Votre inscription Stripe n'est pas terminée… » et le bouton pour la reprendre, **pas** « Compte Stripe connecté ! ».
  - Étape 3 : retour sur « 🎉 Compte Stripe connecté ! » ; l'annonce de ce compte n'affiche plus de bandeau jaune.
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
- **Statut courant** : Partiel

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-08 | Testeur (AI Framework) | Partiel | Déconnecté, sur https://www.nestock.pro : menu ordinateur lu = Accueil, À propos, Messages, Dashboard, Contact (ordre conforme), aucune entrée Carte ni Déposer : conforme. Étape 2 (menu mobile sur fenêtre 390px) non réalisable : pas de contrôle de la taille de fenêtre disponible dans l'outil de navigation. |

### T-NAV-02 — Menu utilisateur connecté

- **Objectif** : un utilisateur connecté voit en plus « Déposer ».
- **Prérequis** : compte de test connecté.
- **Étapes** :
  1. Lire le menu du haut sur ordinateur.
  2. Sur mobile, lire la barre de navigation fixe en bas d'écran.
- **Résultat attendu** : ordinateur, dans cet ordre : **Accueil, À propos, Messages, Dashboard, Déposer, Contact** ; mobile (barre du bas) : **Accueil, Messages, Dashboard, Déposer, Profil**.
- **Statut courant** : Bloqué

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-08 | Testeur (AI Framework) | Bloqué | Tentative de connexion avec le compte Propriétaire sur /login : message Invalid login credentials, retour sur /login. Même résultat avec les comptes Locataire et 3e compte. Test bloqué faute de compte de test fonctionnel. |

### T-NAV-03 — Pages réservées : redirection vers la connexion

- **Objectif** : les pages réservées renvoient vers la connexion quand on n'est pas connecté.
- **Prérequis** : être déconnecté.
- **Étapes** : ouvrir successivement `/messages`, `/dashboard`, `/spaces/new`, `/stripe/connect`, `/api/stripe/dashboard`.
- **Résultat attendu** : chaque adresse redirige vers `https://www.nestock.pro/login` (pour `/api/stripe/dashboard` : `/login?raison=stripe&next=/api/stripe/dashboard`), sans afficher le contenu de la page (en particulier, aucun formulaire « Déposer » visible).
- **Statut courant** : OK

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-06 | Claude Code | OK | Vérifié par `curl` (sans suivre les redirections) : `/messages`, `/dashboard`, `/spaces/new`, `/stripe/connect` → 307 vers `https://www.nestock.pro/login` ; `/api/stripe/dashboard` → 307 vers `https://www.nestock.pro/login?raison=stripe&next=/api/stripe/dashboard`. Le contenu des pages n'est pas servi (redirection côté serveur). |
| 2026-10-06 | Testeur (AI Framework) | OK | Re-test par requêtes directes : `/messages`, `/dashboard`, `/spaces/new`, `/stripe/connect` → 307 vers `/login` ; `/api/stripe/dashboard` → 307 vers `https://www.nestock.pro/login?raison=stripe&next=/api/stripe/dashboard`. Le corps renvoyé avec la redirection ne contient que la coquille technique de la page (scripts, méta), aucun contenu réel (pas de formulaire « Déposer », pas de liste de messages). |

---

## Dashboard

### T-DASH-01 — Le Dashboard affiche le tableau de bord, pas la carte

- **Objectif** : vérifier la restauration du vrai tableau de bord (écrasé par la page d'accueil le 10/08/2026).
- **Prérequis** : compte de test connecté ayant au moins une annonce ou une location.
- **Étapes** :
  1. Cliquer sur **Dashboard** dans le menu.
  2. Parcourir la page.
- **Résultat attendu** : sections de locations et d'annonces avec statuts, boutons (quittances, préavis, suppression d'annonce…) ; **aucune carte** ni liste « espaces trouvés ».
- **Statut courant** : Bloqué

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-08 | Testeur (AI Framework) | Bloqué | Connexion impossible avec le compte Propriétaire sur https://www.nestock.pro/login : message Invalid login credentials. Impossible d'ouvrir /dashboard en tant qu'utilisateur connecté. |

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
- **Statut courant** : OK

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-08 | Testeur (AI Framework) | OK | Sur /login, déconnecté : adresse inexistante + mot de passe quelconque, e-mail valide + mauvais mot de passe, et champs vides, produisent respectivement Invalid login credentials, Invalid login credentials, et missing email or phone, dans les trois cas sans quitter /login et sans erreur technique visible. Messages en anglais, non traduits. |

### T-AUTH-03 — Mot de passe oublié de bout en bout

- **Objectif** : le lien de réinitialisation reçu par e-mail fonctionne, pour un utilisateur comme pour le compte admin.
- **Source** : 01-Nestock-context.md (bug 11/05 « Lien reset password invalide »)
- **Prérequis** : compte de test utilisateur avec accès à sa boîte mail ; compte admin de test avec accès à sa boîte mail (base de test uniquement, jamais le vrai compte admin).
- **Étapes** :
  1. Sur /login, cliquer « Mot de passe oublié ? », saisir l'e-mail du compte de test utilisateur.
  2. Ouvrir l'e-mail reçu et cliquer sur le lien.
  3. Saisir un nouveau mot de passe, valider.
  4. Se connecter avec le nouveau mot de passe.
  5. Refaire les étapes 1 à 4 avec le compte admin de test.
- **Résultat attendu** :
  - E-mail reçu en quelques minutes, pour les deux comptes (vérifier aussi les spams).
  - Le lien ouvre https://www.nestock.pro/reset-password (pas une erreur, pas l'ancien domaine nestock.tsukee.fr, pas localhost).
  - Connexion réussie avec le nouveau mot de passe.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-10 | Utilisateur (manuel) + Claude Code | Bloqué | Non concluant : sur https://www.nestock.pro/forgot-password, demande pour contact@nestock.pro, page « Email envoyé ! » mais aucun e-mail. Cause : cette adresse n'a pas de compte sur le site en ligne (elle n'est que dans la table waitlist) ; Supabase affiche la même confirmation sans rien envoyer, ce qui est le comportement attendu (étape 2 de T-AUTH-06). L'envoi des e-mails n'est pas en cause à ce stade. Ajout du même jour : /reset-password accepte aussi les liens `?token_hash=` (format recommandé par Supabase). |

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

### T-AUTH-05 — Connexion réussie : utilisateur et admin

- **Objectif** : un utilisateur et un administrateur peuvent se connecter et arrivent au bon endroit.
- **Source** : 02-Nestock-Fonctionnalites.md §2.1 et §2.12
- **Prérequis** : être déconnecté ; un compte de test utilisateur (ex. Locataire) et un compte admin de test (base de test uniquement, jamais le vrai compte admin).
- **Étapes** :
  1. Ouvrir /login, saisir l'e-mail et le mot de passe du compte utilisateur, appuyer sur la touche Entrée.
  2. Si rien ne se passe, cliquer sur « Se connecter ».
  3. Vérifier le menu du haut, puis ouvrir /admin.
  4. Se déconnecter, puis ouvrir /admin/tests (non connecté) et se connecter avec le compte admin de test.
  5. Vérifier le menu du haut, puis ouvrir /admin/inscrits, /admin/calendrier et /admin/tests.
  6. Se déconnecter, ouvrir https://www.nestock.pro, cliquer sur « Connexion » dans le menu du haut et se connecter avec le compte admin de test.
  7. Se déconnecter et refaire l'étape 6 avec le compte utilisateur.
- **Résultat attendu** :
  - Compte utilisateur : connexion réussie, le menu affiche le compte connecté, sans lien « Administration » ; /admin renvoie vers l'accueil.
  - Compte admin : connexion réussie, retour dans l'espace d'administration ; le menu du haut affiche « Administration » ; les trois pages s'affichent avec leurs données.
  - Étape 6 : le compte admin arrive directement dans l'espace d'administration (/admin/inscrits), sans passer par l'accueil.
  - Étape 7 : le compte utilisateur arrive sur l'accueil, comme avant.
  - Signaler en observation si la touche Entrée ne valide pas le formulaire (connu le 10/10/2026 : il faut cliquer sur le bouton).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-AUTH-06 — Réinitialisation du mot de passe : cas d'erreur

- **Objectif** : les erreurs pendant la réinitialisation sont expliquées clairement, en français, sans plantage.
- **Source** : 01-Nestock-context.md (10/10/2026, panne de l'e-mail de réinitialisation)
- **Prérequis** : compte de test utilisateur avec accès à sa boîte mail ; être déconnecté.
- **Étapes** :
  1. Sur /forgot-password, valider avec le champ vide, puis avec une adresse mal écrite (ex. « test@ »).
  2. Sur /forgot-password, saisir une adresse qui n'a pas de compte.
  3. Demander un lien pour le compte de test, l'ouvrir, puis saisir deux mots de passe différents.
  4. Saisir un mot de passe de moins de 6 caractères (identique dans les deux champs).
  5. Saisir un mot de passe valide et le confirmer. Puis rouvrir le même lien une deuxième fois.
  6. Demander deux liens de suite, puis ouvrir le premier.
  7. Ouvrir directement https://www.nestock.pro/reset-password (sans lien), attendre quelques secondes et essayer de changer le mot de passe.
  8. Ouvrir https://www.nestock.pro/reset-password?token_hash=faux.
- **Résultat attendu** :
  - Étape 1 : message d'erreur en français, on reste sur la page.
  - Étape 2 : même page de confirmation que pour une adresse inscrite (le site ne révèle pas qui est inscrit), aucun e-mail envoyé.
  - Étape 3 : « Les mots de passe ne correspondent pas ».
  - Étape 4 : « Le mot de passe doit faire au moins 6 caractères ».
  - Étape 5 : mot de passe changé, retour sur /login ; à la deuxième ouverture, page « Lien invalide » avec « Demander un nouveau lien ».
  - Étape 6 : le premier lien est refusé (page « Lien invalide ») ou accepté, noter lequel en observation.
  - Étapes 7 et 8 : page « Lien invalide » ou message clair en français ; jamais de formulaire qui échoue avec un message technique en anglais (ex. « Auth session missing! »).
  - Signaler en observation tout message en anglais.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-AUTH-07 — E-mail de confirmation d'inscription aux couleurs de Nestock

- **Objectif** : l'e-mail de confirmation d'inscription vient clairement de Nestock (expéditeur, sujet, contenu) et son lien active le compte.
- **Source** : 01-Nestock-context.md (11/10/2026, e-mails d'authentification envoyés par le SMTP Hostinger avec un modèle Nestock)
- **Prérequis** : SMTP personnalisé et modèle « Confirm signup » configurés dans Supabase ; une adresse e-mail de test jamais utilisée, avec accès à sa boîte mail ; être déconnecté.
- **Étapes** :
  1. Ouvrir https://www.nestock.pro/register, remplir tous les champs avec l'adresse de test et valider.
  2. Ouvrir la boîte mail (vérifier aussi les spams) et relever : expéditeur, sujet, contenu, délai de réception.
  3. Cliquer sur « Confirmer mon adresse e-mail ».
  4. Se connecter avec l'adresse et le mot de passe choisis.
- **Résultat attendu** :
  - E-mail reçu en quelques minutes, pas dans les spams.
  - Expéditeur : « Nestock » <contact@nestock.pro> ; aucune mention de Supabase (ni dans l'expéditeur, ni dans le texte).
  - Sujet : « Confirmez votre inscription sur Nestock ».
  - Contenu en français, vouvoiement, couleurs de Nestock (bouton bleu), signature « L'équipe Nestock ».
  - Le lien ouvre https://www.nestock.pro (pas l'ancien domaine nestock.tsukee.fr, pas localhost) et le compte est confirmé : la connexion fonctionne.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-AUTH-08 — E-mail de réinitialisation du mot de passe aux couleurs de Nestock

- **Objectif** : l'e-mail de réinitialisation du mot de passe vient clairement de Nestock (expéditeur, sujet, contenu) et son lien permet de changer le mot de passe.
- **Source** : 01-Nestock-context.md (11/10/2026, e-mails d'authentification envoyés par le SMTP Hostinger avec un modèle Nestock)
- **Prérequis** : SMTP personnalisé et modèle « Reset password » configurés dans Supabase ; compte de test utilisateur avec accès à sa boîte mail ; être déconnecté.
- **Étapes** :
  1. Sur /login, cliquer « Mot de passe oublié ? », saisir l'e-mail du compte de test et valider.
  2. Ouvrir la boîte mail (vérifier aussi les spams) et relever : expéditeur, sujet, contenu, délai de réception.
  3. Cliquer sur « Choisir un nouveau mot de passe ».
  4. Saisir un nouveau mot de passe, le confirmer, valider.
  5. Se connecter avec le nouveau mot de passe.
- **Résultat attendu** :
  - E-mail reçu en quelques minutes, pas dans les spams.
  - Expéditeur : « Nestock » <contact@nestock.pro> ; aucune mention de Supabase (ni dans l'expéditeur, ni dans le texte).
  - Sujet : « Réinitialisation de votre mot de passe Nestock ».
  - Contenu en français, vouvoiement, couleurs de Nestock (bouton bleu), phrase indiquant quoi faire si on n'a rien demandé, signature « L'équipe Nestock ».
  - Le lien ouvre https://www.nestock.pro/reset-password ; mot de passe changé puis connexion réussie.
- **Statut courant** : Partiel

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-11 | Utilisateur (manuel) + Claude Code | Partiel | Premier essai après configuration du SMTP Hostinger dans Supabase prod : pas d'e-mail, rien de visible dans Logs → Auth. Appel direct de `POST /auth/v1/recover` sur la prod → `500 {"error_code":"unexpected_failure","msg":"Error sending recovery email"}`. Identifiants Hostinger du site vérifiés valides (ports 465 et 587) ; mot de passe SMTP recollé dans Supabase → même appel `200 {}`. E-mail reçu sur contact@nestock.pro, signé Nestock (étapes 1 et 2 OK). Étapes 3 à 5 (lien, nouveau mot de passe, connexion) non encore rapportées. Hypothèse : mot de passe SMTP mal saisi lors de la première configuration. |

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
  - Supabase, table `invoices` : la ligne du premier paiement a un `stripe_payment_id` renseigné (`pi_…`), pas vide.
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
| 2026-10-06 | Testeur (AI Framework) | Partiel | Étape 1 : `POST /api/stripe/webhook` avec `stripe-signature: invalide` et corps vide → code `400`, réponse `{"error":"Signature invalide"}`, sans URL de redirection : conforme au résultat attendu. Étape 2 non réalisable : aucun accès au tableau de bord Stripe (compte/identifiants non fournis à l'agent) pour vérifier que les vraies tentatives de webhook arrivent en 200. |

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

### T-PAY-04 — Prélèvement le 1er du mois, 1er paiement au prorata

- **Objectif** : le loyer est prélevé le 1er de chaque mois ; le premier paiement couvre seulement les jours restants du mois en cours.
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026) ; évolution « prélèvement le 1er du mois »
- **Prérequis** : T-RESA-03 (contrat signé par les deux parties, compte Stripe du propriétaire actif). Webhook Stripe **mode test** déclaré vers `https://www.nestock.pro/api/stripe/webhook`, avec son `STRIPE_WEBHOOK_SECRET` sur Vercel (projet `stock-kb8s`). Il était absent au 19/10/2026 (voir 01-Nestock-context.md) : sans lui, exécuter le test en local (`http://localhost:3000` + `stripe listen`).
- **Étapes** :
  1. En Locataire, payer le 1er mois avec la carte de test.
  2. Stripe (mode test) → Clients → client du locataire → abonnement : lire la prochaine date de facturation et le montant de la 1re facture.
  3. Calculer le prorata attendu : prix mensuel TTC × jours restants dans le mois (jour du paiement compris) ÷ jours du mois.
- **Résultat attendu** :
  - Étape 1 : la page de paiement Stripe annonce un montant inférieur au prix mensuel (sauf paiement le 1er), puis le prix mensuel à partir du 1er du mois suivant.
  - Étape 2 : prochaine facturation **le 1er du mois suivant** ; 1re facture égale au prorata de l'étape 3, à quelques centimes près.
  - La location passe « En cours » ; quittance reçue.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-PAY-05 — Reversement au propriétaire : 1er mois partiel puis mois entiers

- **Objectif** : le propriétaire reçoit exactement son loyer pour un mois entier, et la même proportion pour le 1er mois partiel ; Nestock garde sa commission.
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026) ; reversement codé le 14/10/2026, testé le 15/10/2026
- **Prérequis** : T-PAY-04 fait. Accès au tableau de bord Stripe (mode test).
- **Étapes** :
  1. Stripe (mode test) → Connect → compte connecté du Propriétaire → Transferts (ou Paiements reçus).
  2. Comparer le 1er transfert avec : loyer du propriétaire × montant de la 1re facture ÷ prix mensuel TTC.
  3. Pour les mois suivants : Test Clock (annexe, étape 3) ou attendre le 1er du mois, puis relire les transferts.
- **Résultat attendu** :
  - Étape 2 : un transfert par paiement, égal au calcul (à 1 centime près), rattaché au paiement du locataire, avec l'identifiant de la réservation en métadonnée.
  - Étape 3 : un transfert égal au loyer exact du propriétaire (ex. 50,00 € pour une annonce à 50 €) pour chaque mois entier.
  - Aucun e-mail « Nestock — reversement en échec » sur contact@nestock.pro.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-PAY-06 — Reprendre un paiement abandonné (bouton « Payer »)

- **Objectif** : un locataire qui a signé mais quitté la page de paiement Stripe peut payer plus tard.
- **Source** : évolution du 19/10/2026 (l'ancien bouton « Payer » était inutilisable et au mauvais prix)
- **Prérequis** : contrat signé par le Propriétaire. Webhook Stripe **mode test** déclaré vers `https://www.nestock.pro/api/stripe/webhook`, avec son `STRIPE_WEBHOOK_SECRET` sur Vercel (projet `stock-kb8s`). Il était absent au 19/10/2026 (voir 01-Nestock-context.md) : sans lui, exécuter le test en local (`http://localhost:3000` + `stripe listen`).
- **Étapes** :
  1. En Locataire, signer le contrat puis, sur la page Stripe, cliquer sur la flèche de retour sans payer.
  2. Ouvrir le Dashboard du Locataire, puis la page du contrat.
  3. Cliquer « 💳 Payer » et payer avec la carte de test.
  4. En Propriétaire, ouvrir la page du contrat.
- **Résultat attendu** :
  - Étape 2 : bouton « 💳 Payer » sur la location (Dashboard) ; sur le contrat, bloc « Il ne reste plus que le paiement ».
  - Étape 3 : page Stripe d'abonnement mensuel au prix du contrat (1er mois au prorata, cf. T-PAY-04) ; après paiement, location « En cours ».
  - Étape 4 : pas de bloc de paiement côté propriétaire.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|


---

## Résiliation

### T-RESIL-01 — Préavis : affichage des deux côtés et accusé de réception

- **Objectif** : le préavis démarre, s'affiche des deux côtés et programme la fin du prélèvement Stripe. Depuis le 19/10/2026, la fin tombe toujours en fin de mois (détail de la règle : T-RESIL-04).
- **Source** : 02-Nestock-Fonctionnalites.md §2.8 ; 01-Nestock-context.md (règle de fin de mois, 19/10/2026)
- **Prérequis** : location active (T-PAY-01).
- **Étapes** :
  1. En Locataire, cliquer « Résilier » depuis le Dashboard ou la page détail.
  2. Consulter le Dashboard des deux comptes.
  3. En Propriétaire, cliquer sur l'accusé de réception du préavis.
  4. Dans Stripe (mode test), ouvrir l'abonnement.
- **Résultat attendu** :
  - Statut « en préavis » avec le nombre de jours restants jusqu'à la fin (dernier jour du mois en cours ou du mois suivant) des deux côtés ; notification + e-mail à l'autre partie.
  - Accusé de réception enregistré et visible.
  - Abonnement Stripe : « Cancels on [1er du mois qui suit la fin] ».
  - L'annonce affiche « ⏳ Disponible le [date de fin] ».
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESIL-02 — Cycle complet : prélèvement le 1er → préavis → fin sans remboursement

- **Objectif** : valider le prélèvement le 1er du mois, l'annulation programmée en fin de mois, l'absence de remboursement et la clôture par le cron, sans attendre la fin du mois.
- **Source** : annexe « Protocole Stripe Test Clocks » (ci-dessous) ; règles du 19/10/2026 (prélèvement le 1er, fin en fin de mois, plus de remboursement au prorata). Les scripts `scripts/test-reversement/` (setup, t1, t2, t3) font la même chose en local.
- **Prérequis** : accès au tableau de bord Stripe (mode test) et à Supabase ; CRON_SECRET ; version du site déployée contenant le commit e766249.
- **Étapes** :
  1. Dérouler intégralement le protocole de l'annexe (étapes 1 à 6, puis nettoyage).
  2. Reporter dans les observations le résultat de chaque bloc « ✅ Vérifications ».
- **Résultat attendu** :
  - Toutes les vérifications de l'annexe sont validées, en particulier :
  - **Prélèvement du 1er du mois** (`invoice.paid`, renouvellement) : webhook en 200, nouvelle ligne `invoices` avec `stripe_payment_id` renseigné, quittance reçue par e-mail par les deux parties, notifications « Loyer prélevé » / « Loyer reçu », reversement du loyer entier au propriétaire.
  - `cancel_at` programmé au **1er du mois qui suit la fin** (règle du 15).
  - **Fin de la location** : aucune facture après la fin, **aucun remboursement**, aucune reprise de transfert au propriétaire, aucun e-mail « Remboursement au prorata ».
  - **Aucun avoir** sur le compte du client dans Stripe : solde client à 0 €, aucune ligne de prorata (« Unused time… ») sur ses factures.
  - Cron : `processed` ≥ 1, statut `ended`, annonce de nouveau disponible.
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
- **Statut courant** : OK

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-06 | Claude Code | OK | Sans secret → `401` ; avec `Authorization: Bearer faux` → `401`. |
| 2026-10-06 | Testeur (AI Framework) | OK | Re-test : `GET /api/cron/end-bookings` sans en-tête → `401 {"error":"Non autorise"}` ; avec `Authorization: Bearer faux` → `401 {"error":"Non autorise"}`. Les deux tentatives sont refusées, conforme au résultat attendu. |

### T-RESIL-04 — Fin de location toujours en fin de mois (règle du 15)

- **Objectif** : préavis donné jusqu'au 15 inclus → fin le dernier jour du mois en cours ; après le 15 → fin le dernier jour du mois suivant ; l'abonnement s'arrête pile à cette date.
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026) ; règle demandée par l'utilisateur le 19/10/2026
- **Prérequis** : location active (T-PAY-04). Noter la date du jour (heure de Paris).
- **Étapes** :
  1. En Locataire, cliquer « Résilier » sur la location.
  2. Lire le message automatique de la conversation et la date de fin affichée sur le Dashboard des deux comptes.
  3. Stripe (mode test) → abonnement du locataire : lire « Cancels on … ».
- **Résultat attendu** :
  - Étape 2 : si le jour est ≤ 15, fin le **dernier jour du mois en cours** ; sinon, fin le **dernier jour du mois suivant**. Message « Un préavis a été donné. La location prendra fin le … au soir ; le dernier mois prélevé est dû en entier. »
  - Étape 3 : annulation programmée le **1er du mois qui suit la fin**, à minuit (heure de Paris) ; aucun avoir ni ligne de prorata sur le client.
  - Le bouton s'appelle « Résilier » (plus « (15j) »).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESIL-05 — Le locataire peut résilier (re-test du bug du 19/10/2026)

- **Objectif** : une résiliation demandée par le locataire est bien enregistrée.
- **Source** : bug corrigé le 19/10/2026 : la règle d'accès de `bookings` ne laissait modifier que le propriétaire, la demande du locataire était ignorée alors que le site affichait un succès
- **Prérequis** : location active (T-PAY-04).
- **Étapes** :
  1. En Locataire, cliquer « Résilier ».
  2. Recharger le Dashboard du Locataire, puis celui du Propriétaire.
  3. En Propriétaire, « ✅ Accuser réception ».
  4. En admin, /admin/locations → la location → rubrique « Résiliation ».
- **Résultat attendu** :
  - Étape 2 : la location est « en préavis » des deux côtés, avec « Préavis initié par le locataire » et la date de fin.
  - Étape 3 : accusé de réception enregistré et visible.
  - Étape 4 : « Demandée par le locataire », « Demandée le » (date et heure), « Fin de la location », « Accusé de réception » renseignés.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESIL-06 — Aucun remboursement ni reprise à la fin de la location

- **Objectif** : le dernier mois prélevé est dû en entier : Nestock ne rembourse rien et ne reprend rien au propriétaire.
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026)
- **Prérequis** : T-RESIL-04 fait ; Test Clock (annexe, étapes 4 et 5) ou attendre la date de fin.
- **Étapes** :
  1. Avancer l'horloge de test au-delà du 1er du mois qui suit la fin (annexe, étape 5).
  2. Stripe → Paiements, Connect → transferts du propriétaire, client du locataire.
- **Résultat attendu** :
  - Abonnement annulé, **aucune facture après la fin**, **aucun remboursement**, aucune reprise de transfert, solde client à 0 €.
  - Aucun e-mail « Remboursement au prorata ».
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESIL-07 — Actions impossibles à la mauvaise étape de la location

- **Objectif** : on ne peut résilier qu'une location en cours, l'accusé de réception vient de l'autre partie, on ne peut plus refuser une location payée, « ended » est réservé au cron.
- **Source** : durcissement du 19/10/2026 (`app/api/bookings/[id]/status`)
- **Prérequis** : une demande en attente (T-RESA-01) et une location en préavis initiée par le locataire (T-RESIL-05). Exécuter les appels depuis la console du navigateur, connecté avec le compte indiqué : `await fetch('/api/bookings/ID/status', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'…'})}).then(r => r.status)`.
- **Étapes** :
  1. En Locataire, sur la demande en attente : `ending`.
  2. En Locataire, sur la location en préavis : `acknowledge_notice`.
  3. En Locataire, sur la location en préavis : `cancelled`.
  4. En Locataire ou Propriétaire : `ended`, puis `active`.
- **Résultat attendu** :
  - Étape 1 : **409**. Étape 2 : **403**. Étape 3 : **409**. Étape 4 : **400** pour les deux.
  - Aucun statut modifié (vérifier les Dashboards).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-RESIL-08 — Annulation de l'abonnement directement chez Stripe

- **Objectif** : le locataire ne peut pas arrêter son abonnement hors de Nestock ; si cela arrive quand même, l'administrateur est alerté.
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026) ; paramétrage Stripe à faire (portail client)
- **Prérequis** : location active ; paramétrage « Stripe → Paramètres → Billing → Portail client : annulation désactivée » fait.
- **Étapes** :
  1. En Locataire, Dashboard → gestion du paiement (portail Stripe, T-PAY-03).
  2. Chercher une option d'annulation de l'abonnement.
- **Résultat attendu** :
  - Aucune option « Annuler l'abonnement » dans le portail.
  - Si l'annulation est encore possible : l'annuler, puis vérifier l'e-mail « Nestock — abonnement arrêté depuis Stripe » sur contact@nestock.pro et la date de fin appliquée (règle du 15) — et signaler le paramétrage manquant.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|


---

## Mise en production

### T-PROD-01 — Passage de Stripe en mode live

- **Objectif** : basculer les paiements en réel sans casser le webhook, et le prouver avec un vrai paiement.
- **Source** : session du 06/10/2026 (préparation de la mise en production).
- **Exécutant** : **humain uniquement** (vraie carte, clés live). Exception à la consigne 1 : ce test se fait en mode **live**. Un agent peut seulement exécuter l'étape 6 et relire les résultats.
- **Prérequis** :
  - T-RESIL-02 **OK** (et T-PAY-02 OK) — ne jamais commencer avant.
  - Compte Stripe validé par Stripe (SIRET, pièce d'identité, IBAN) et mode live débloqué.
- **Étapes** :
  1. Stripe (mode live) → Connect : compléter le profil de plateforme.
  2. Stripe (mode live) → Développeurs → Webhooks : créer un endpoint `https://www.nestock.pro/api/stripe/webhook` avec les 4 événements `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`. Noter sa clé `whsec_…` (différente de celle du mode test).
  3. Vercel, projet qui sert nestock.pro (`stock-kb8s`) : remplacer `STRIPE_SECRET_KEY` (`sk_live_…`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_live_…`) et `STRIPE_WEBHOOK_SECRET` (`whsec_…` live) pour l'environnement Production. Stripe live → Paramètres → Billing → Portail client : désactiver l'annulation d'abonnement.
  4. Redéployer la production (les variables ne sont prises en compte qu'au déploiement suivant).
  5. Vérifier que l'endpoint répond sans redirection : `curl -I https://www.nestock.pro/api/stripe/webhook`.
  6. Faire un vrai paiement de bout en bout (petit montant, annonce et comptes réels), puis consulter Stripe live → Webhooks → tentatives récentes, Supabase `bookings` / `invoices`, et les e-mails.
  7. Résilier cette location de test (fin en fin de mois, aucun remboursement automatique depuis le 19/10/2026), puis rembourser le paiement à la main depuis Stripe live et reprendre le transfert au propriétaire si besoin.
- **Résultat attendu** :
  - Étape 5 : code **405** (méthode non autorisée : la route n'accepte que POST), jamais 307/308 ni 404.
  - Étape 6 : événement `checkout.session.completed` en **200** dans le webhook live ; location `active` ; ligne `invoices` avec `stripe_payment_id` renseigné ; quittance reçue par les deux parties ; commission de 10 % prélevée et le reste transféré au compte connecté du propriétaire.
  - Étape 7 : l'argent du paiement de test est revenu sur la carte.
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

- **Objectif** : l'espace d'administration (/admin) n'est accessible qu'à un compte connecté ayant le rôle admin.
- **Source** : 02-Nestock-Fonctionnalites.md §2.12
- **Prérequis** : aucun pour les étapes 1 à 3 ; un compte de test **non admin** (ex. Locataire) pour l'étape 4. Ne jamais utiliser le compte admin.
- **Étapes** :
  1. En navigation privée (non connecté), ouvrir /admin, /admin/inscrits, /admin/calendrier et /admin/tests.
  2. Ouvrir les anciennes adresses /admin-waitlist, /admin-inscrits, /admin-calendar et /admin-tests.
  3. Sans être connecté, appeler `GET /api/admin-tests` et `POST /api/admin-calendar` avec `{"action":"get"}`.
  4. Se connecter avec le compte non admin, puis ouvrir /admin/calendrier et refaire les appels de l'étape 3.
- **Résultat attendu** :
  - Étape 1 : redirection vers la page de connexion, aucune donnée affichée.
  - Étape 2 : redirection vers /admin/..., puis même comportement qu'à l'étape 1.
  - Étape 3 : `401 {"error":"Non autorise"}`, aucune donnée renvoyée.
  - Étape 4 : redirection vers l'accueil (/) ; les API répondent `401`. Aucun lien « Administration » dans le menu.
- **Statut courant** : À faire (test réécrit le 10/10/2026 : le mot de passe commun a été remplacé par le rôle admin ; les résultats ci-dessous portent sur l'ancienne version)

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-06 | Claude Code | OK | Vérifié par `curl` (étapes équivalentes à la navigation privée) : `/admin-waitlist` et `/admin-calendar` → 200 avec formulaire de mot de passe seul, aucune donnée dans le HTML. Les données passent par les API : `POST /api/admin-waitlist` avec mauvais mot de passe → `401 {"error":"Mot de passe incorrect"}` ; `POST /api/admin-calendar` avec mauvais mot de passe → `401 {"error":"Non autorise"}`, sans mot de passe (`{"action":"get"}`) → `401`. Hypothèse : `/api/admin-calendar` ne vérifie pas que `ADMIN_PASSWORD` est défini (`password !== process.env.ADMIN_PASSWORD`) ; si la variable disparaissait de Vercel, une requête sans mot de passe passerait. `/api/admin-waitlist` fait bien ce contrôle. |
| 2026-10-06 | Testeur (AI Framework) | OK | Re-test : `GET /admin-waitlist` et `GET /admin-calendar` → `200`, uniquement un formulaire de mot de passe (aucune donnée de waitlist ni de calendrier dans le HTML). `POST /api/admin-waitlist` avec mauvais mot de passe → `401 {"error":"Mot de passe incorrect"}` ; `POST /api/admin-calendar` avec mauvais mot de passe → `401 {"error":"Non autorise"}`. Conforme au résultat attendu. |

### T-SEC-03 — Comptes non admin : aucun accès à l'administration

- **Objectif** : seul le compte ayant le rôle admin voit et ouvre l'espace d'administration ; tous les autres comptes connectés n'en voient ni le lien, ni les pages, ni les données.
- **Source** : 02-Nestock-Fonctionnalites.md §2.12, 01-Nestock-context.md (11/10/2026, accès admin par le rôle sur contact@nestock.pro)
- **Prérequis** : les trois comptes de test non admin (Propriétaire, Locataire, 3e compte) ; un compte de test tout juste inscrit (voir T-AUTH-01) ; l'identifiant d'un inscrit (relevé par l'administrateur dans l'adresse d'une fiche /admin/inscrits/…). Ne jamais utiliser le compte admin.
- **Étapes** (à refaire avec chacun des quatre comptes) :
  1. Se déconnecter, ouvrir https://www.nestock.pro, cliquer sur « Connexion » et se connecter.
  2. Regarder le menu du haut sur ordinateur, puis en largeur mobile (menu déroulant).
  3. Ouvrir une à une /admin, /admin/inscrits, /admin/inscrits/<identifiant d'un inscrit>, /admin/calendrier et /admin/tests.
  4. Se déconnecter, ouvrir /login?next=/admin/tests et se connecter.
  5. Connecté, appeler `GET /api/admin-tests` et `POST /api/admin-calendar` avec `{"action":"get"}`.
- **Résultat attendu** :
  - Étape 1 : arrivée sur l'accueil (/), jamais dans l'administration.
  - Étape 2 : aucun lien « Administration », ni sur ordinateur ni sur mobile.
  - Étape 3 : chaque adresse renvoie vers l'accueil (/) ; aucune donnée d'administration visible, même brièvement (liste ou fiche d'inscrit, calendrier, tests).
  - Étape 4 : connexion réussie puis renvoi vers l'accueil, pas de page d'administration.
  - Étape 5 : `401 {"error":"Non autorise"}`, aucune donnée renvoyée.
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
- **Statut courant** : OK

| Date | Agent | Statut | Observations |
|---|---|---|---|
| 2026-10-06 | Claude Code | Échec | Étape 1 OK : `/cgu` et `/confidentialite` → 200, `contact@nestock.pro` présent sur les deux. Étape 3 OK : `/waitlist` → 307 vers `https://www.nestock.pro/`. Étape 2 en échec : **aucune mention RGPD** sur les formulaires de `/register` (`app/(auth)/register/page.tsx`) et `/contact` (`app/contact/page.tsx`) — ni dans le HTML servi ni dans le code ; `/contact` n'a que les liens CGU / Confidentialité du pied de page. |
| 2026-10-06 | Testeur (AI Framework) | Échec | Étape 1 OK : `/cgu` → 200 (titre « Conditions Générales d'Utilisation », `contact@nestock.pro` présent) ; `/confidentialite` → 200 (titre « Politique de Confidentialité », mention « article 6.1.b RGPD », `contact@nestock.pro` présent). Étape 3 OK : `/waitlist` → 307 vers `/`. Étape 2 en échec : le formulaire de `/register` (champs nom, e-mail, téléphone, adresse, mot de passe, bouton « Créer mon compte ») ne comporte aucune mention RGPD ni case à cocher ni lien vers la politique de confidentialité dans le HTML rendu ; le formulaire de `/contact` (nom, e-mail, sujet, message) n'en comporte pas non plus, seul le pied de page affiche les liens CGU/Confidentialité, pas une mention RGPD sur le formulaire lui-même. |
| 2026-10-06 | Testeur (AI Framework) | OK | Étape 1 : `/cgu` → 200 (titre « Conditions Générales d'Utilisation », mention « contact@nestock.pro » présente en pied de texte, article 8) ; `/confidentialite` → 200 (titre « Politique de Confidentialité », mention « article 6.1.b RGPD », « contact@nestock.pro » présent). Étape 3 : `/waitlist` → 307 vers `/`. Étape 2 : contrairement au retour précédent du jour (Échec), le formulaire de `/register` contient désormais le texte « Conformément au RGPD, vous pouvez y accéder, les rectifier, les supprimer ou vous opposer à leur traitement en écrivant à contact@nestock.pro », avec lien vers les CGU ; le formulaire de `/contact` contient « Conformément au RGPD, vous pouvez y accéder, les rectifier ou les faire supprimer en écrivant à contact@nestock.pro » avec lien vers la Politique de confidentialité. Les trois étapes sont désormais conformes au résultat attendu. |

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

### T-SEC-04 — Un locataire ne peut pas signer à la place du propriétaire

- **Objectif** : le rôle du signataire est déterminé par le serveur, pas par le navigateur.
- **Source** : faille corrigée le 19/10/2026 (`isOwner` envoyé par le navigateur à /api/contracts/sign)
- **Prérequis** : contrat non signé (T-RESA-03 avant signature), compte Stripe du propriétaire actif. Console du navigateur connecté en Locataire.
- **Étapes** :
  1. Exécuter `await fetch('/api/contracts/sign', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({contractId:'ID_CONTRAT', bookingId:'ID_RESA', signatureName:'Test', birthDate:'1990-01-01', isOwner:true})}).then(r => r.status)`.
  2. Ouvrir la page du contrat.
- **Résultat attendu** :
  - Étape 1 : **403**.
  - Étape 2 : signature du propriétaire toujours vide.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-SEC-05 — Statuts et paiement réservés aux bonnes personnes

- **Objectif** : un locataire ne peut ni accepter sa propre demande, ni passer sa location « active » sans payer, ni lancer le paiement d'un autre ; le propriétaire ne peut pas lancer le paiement.
- **Source** : failles corrigées le 19/10/2026
- **Prérequis** : une demande en attente (T-RESA-01) et un contrat signé non payé (T-PAY-06, étape 1). Console du navigateur.
- **Étapes** :
  1. En Locataire, demande en attente : `status: 'confirmed'` sur /api/bookings/ID/status.
  2. En Locataire : `status: 'active'`.
  3. En Propriétaire, contrat signé non payé : `await fetch('/api/stripe/checkout', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({bookingId:'ID_RESA'})}).then(r => r.status)`.
  4. En 3e compte : même appel.
- **Résultat attendu** :
  - Étape 1 : **403**. Étape 2 : **400**. Étapes 3 et 4 : **403**.
  - Aucun statut modifié.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-SEC-06 — Tâche de clôture : « Bearer undefined » refusé

- **Objectif** : la tâche automatique ne s'ouvre jamais avec un secret absent ou « undefined ».
- **Source** : faille corrigée le 19/10/2026 (commit 1f7d1f9) ; `CRON_SECRET` ajouté sur Vercel (`stock-kb8s`) le 19/10/2026
- **Prérequis** : aucun.
- **Étapes** :
  1. `curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer undefined' https://www.nestock.pro/api/cron/end-bookings`
  2. `curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer ' https://www.nestock.pro/api/cron/end-bookings`
- **Résultat attendu** :
  - Les deux appels renvoient **401**.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-SEC-07 — Réservations non lisibles avec la clé publique

- **Objectif** : personne ne peut lire la liste des réservations avec la clé publique du site.
- **Source** : faille relevée le 19/10/2026 : règle « API peut lire les réservations » (`bookings`, SELECT, `true`) — 13 lignes lisibles en prod
- **Prérequis** : code du 19/10/2026 en ligne (`lib/availability.ts`) **et** `supabase/bookings-lecture.sql` lancé sur la prod (sinon le test est en `Échec` attendu). La clé publique (anon) et l'URL Supabase de la prod, visibles dans le code du site (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Étapes** :
  1. `curl -s -D - -o /dev/null 'https://rkcewsargthrbiokhend.supabase.co/rest/v1/bookings?select=id&limit=0' -H 'apikey: CLE_ANON' -H 'Prefer: count=exact'` (ne lit aucune donnée, seulement le nombre).
  2. Ouvrir une annonce louée sans être connecté, et une annonce libre.
- **Résultat attendu** :
  - Étape 1 : `content-range: */0` (aucune réservation visible) ou une erreur d'accès.
  - Étape 2 : l'annonce louée affiche toujours « 🔒 Espace actuellement loué » et l'annonce libre le bouton de demande ; sur la carte de l'accueil, badges « Loué » / « Préavis en cours » / « À louer » justes (les disponibilités sont lues côté serveur).
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-SEC-08 — Anciennes adresses qui créaient une réservation : supprimées

- **Objectif** : ouvrir un lien ne suffit plus à créer une demande de réservation ou une conversation au nom de la personne connectée (lien piégé envoyé par un tiers).
- **Source** : suppression le 20/10/2026 de `/api/contact/[spaceId]` et `/api/message/[spaceId]` (GET qui créaient une réservation `pending` / `message_only`, appelées par aucune page)
- **Prérequis** : compte Locataire ; l'ID d'une annonce publiée (dans l'adresse de sa page /spaces/ID).
- **Étapes** :
  1. `curl -s -o /dev/null -w '%{http_code}' https://www.nestock.pro/api/contact/ID` puis la même chose avec `/api/message/ID`.
  2. Connecté en Locataire, ouvrir https://www.nestock.pro/api/contact/ID puis https://www.nestock.pro/api/message/ID dans le navigateur, puis aller dans Messages.
  3. Depuis la page de l'annonce, faire une demande de réservation et envoyer un message par le parcours normal.
- **Résultat attendu** :
  - Étape 1 : **404** pour les deux adresses.
  - Étape 2 : page introuvable ; aucune nouvelle conversation ni demande dans Messages.
  - Étape 3 : la demande et le message fonctionnent comme avant.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-ADMIN-01 — Dossier de preuves d'une location

- **Objectif** : l'administrateur retrouve en une page tout ce qu'il faut pour répondre à une contestation de paiement.
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026) ; page /admin/locations
- **Prérequis** : compte admin ; une location payée puis résiliée (T-RESIL-05).
- **Étapes** :
  1. En admin, menu Administration → « Locations ».
  2. Ouvrir la location.
  3. Cmd+P → Enregistrer en PDF.
  4. En Locataire, ouvrir la même adresse /admin/locations/ID.
- **Résultat attendu** :
  - Étape 1 : tableau des locations (espace, propriétaire, locataire, statut, début, loyer).
  - Étape 2 : rubriques Location, Propriétaire, Locataire (avec « CGU acceptées à l'inscription » pour les comptes créés depuis le 19/10/2026), Contrat (signatures : date, nom, IP, navigateur, version des CGU), Paiements (factures Stripe), Reversements/remboursements/contestations, Résiliation, Messages ; pas de « Stripe illisible ».
  - Étape 3 : le PDF est lisible.
  - Étape 4 : redirection hors de l'administration.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-LEGAL-02 — CGU obligatoires à l'inscription et enregistrées

- **Objectif** : on ne peut pas créer de compte sans accepter les CGU ; l'acceptation (version, date, IP, navigateur) est enregistrée et non modifiable.
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026)
- **Prérequis** : une adresse e-mail de test neuve.
- **Étapes** :
  1. Ouvrir /register, remplir le formulaire **sans** cocher « J'ai lu et j'accepte les conditions générales d'utilisation », valider.
  2. Cocher la case (le lien ouvre /cgu dans un nouvel onglet), valider.
  3. En admin, /admin/inscrits → fiche du compte ; ou, une fois ce compte locataire d'une location, /admin/locations → dossier.
- **Résultat attendu** :
  - Étape 1 : message « Veuillez accepter les conditions générales d'utilisation », aucun compte créé.
  - Étape 2 : compte créé.
  - Étape 3 : dans le dossier, « CGU acceptées à l'inscription : version 2026-10-19, le …, IP … ».
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-LEGAL-03 — CGU et contrat à jour (version du 19/10/2026)

- **Objectif** : les CGU et le contrat décrivent les règles réellement appliquées par le site.
- **Source** : 01-Nestock-context.md, « À faire avant les vrais paiements » (19/10/2026)
- **Prérequis** : un contrat existant (T-RESA-03).
- **Étapes** :
  1. Ouvrir /cgu.
  2. Ouvrir la page d'un contrat, articles 2 et 3.
  3. Signer un contrat (T-RESA-03) et lire la case à cocher.
- **Résultat attendu** :
  - Étape 1 : « Version du 19 octobre 2026 (réf. 2026-10-19) » ; articles : non-responsabilité de Nestock sur les litiges entre propriétaire et locataire (état de l'espace, biens stockés…) ; compte de paiement du propriétaire ; préavis de 15 jours minimum, fin en fin de mois (règle du 15) ; « Mois entamé » (aucun remboursement) ; contestation de paiement.
  - Étape 2 : article 2 avec la règle de fin de mois (plus de « 30 jours ») ; article 3 « le 1er de chaque mois », 1er paiement au prorata.
  - Étape 3 : la case mentionne les conditions générales d'utilisation, avec un lien.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-MAIL-01 — Un e-mail qui ne part pas ne bloque pas l'action

- **Objectif** : si l'envoi d'e-mail échoue (limite d'envoi Hostinger, panne SMTP), la réservation, la signature ou le paiement aboutit quand même ; le formulaire de contact, lui, affiche l'échec.
- **Source** : bug trouvé le 19/10/2026 (limite d'envoi Hostinger atteinte pendant les tests : la demande de réservation était créée mais le site répondait « erreur 500 » ; le webhook Stripe aurait pu être rejoué et créer des factures en double) ; corrigé dans `lib/mailer.ts`
- **Prérequis** : environnement **local** (`http://localhost:3000`), avec un mauvais `SMTP_PASS` dans `.env.local` le temps du test (le remettre ensuite). Ne pas faire ce test en production.
- **Étapes** :
  1. En Locataire, faire une demande de réservation (T-RESA-01).
  2. Envoyer le formulaire /contact.
  3. Lire le terminal de `npm run dev`.
  4. Remettre le bon `SMTP_PASS`, relancer `npm run dev`, renvoyer le formulaire /contact.
- **Résultat attendu** :
  - Étape 1 : la demande est créée et la page passe à la messagerie (pas d'erreur), les notifications du site sont là.
  - Étape 2 : message rouge « Votre message n'a pas pu être envoyé… », pas de « ✅ ».
  - Étape 3 : lignes « E-mail non envoyé à … ».
  - Étape 4 : « ✅ » et e-mail reçu sur contact@nestock.pro.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-MAIL-02 — Formulaire de contact : texte saisi affiché tel quel

- **Objectif** : le texte tapé dans le formulaire de contact ne peut pas modifier la mise en page de l'e-mail reçu par Nestock (pas de HTML interprété).
- **Source** : correction du 19/10/2026 (`app/api/contact-form/route.ts` : saisie échappée)
- **Prérequis** : accès à la boîte contact@nestock.pro. Un seul envoi (limite d'envoi Hostinger).
- **Étapes** :
  1. Sur /contact, envoyer : nom `Test <b>gras</b>`, sujet `Essai <i>HTML</i>`, message sur deux lignes contenant `<a href="https://exemple.com">lien</a>`.
  2. Ouvrir l'e-mail « [Nestock] Contact - … » reçu sur contact@nestock.pro.
- **Résultat attendu** :
  - Les balises apparaissent en texte brut (`<b>gras</b>`, `<a href=…>`), rien n'est en gras ni cliquable ; le retour à la ligne du message est conservé.
  - Le sujet de l'e-mail est sur une seule ligne.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|

### T-CONF-01 — Paramétrage de la production (Vercel, Stripe)

- **Objectif** : vérifier les réglages de production faits ou à faire, pour qu'ils ne se perdent pas.
- **Source** : 01-Nestock-context.md, point Vercel (19/10/2026)
- **Prérequis** : accès aux tableaux de bord Vercel et Stripe (lecture seule).
- **Étapes** :
  1. Vercel → projets : lister les projets.
  2. Vercel → `stock-kb8s` → Settings → Domains, puis Environment Variables (noms seulement).
  3. Vercel → `stock-kb8s` → Cron Jobs → View Logs, le lendemain d'une nuit.
  4. Stripe (mode test, puis live) → Développeurs → Webhooks ; Paramètres → Billing → Portail client.
- **Résultat attendu** :
  - Étape 1 : un seul projet Nestock, `stock-kb8s` (le doublon `stock` est supprimé).
  - Étape 2 : domaines nestock.pro, www.nestock.pro, nestock.tsukee.fr ; variables `CRON_SECRET` et `STRIPE_WEBHOOK_SECRET` présentes, `ADMIN_PASSWORD` absente.
  - Étape 3 : appel de 2 h (UTC) en **200**.
  - Étape 4 : un webhook vers `https://www.nestock.pro/api/stripe/webhook` avec les 4 événements ; annulation d'abonnement désactivée dans le portail client.
- **Statut courant** : À faire

| Date | Agent | Statut | Observations |
|---|---|---|---|


---

## Annexe — Protocole Stripe Test Clocks

Protocole exécuté par **T-RESIL-02**. Il valide en quelques minutes tout le cycle :
1er paiement au prorata → prélèvement le 1er du mois → déclenchement du préavis → annulation Stripe programmée (`cancel_at`) au 1er du mois qui suit la fin → aucun remboursement → clôture par le cron. (Règles du 19/10/2026.)

Il utilise les **Stripe Test Clocks**, qui simulent l'écoulement du temps sans attendre de vrais cycles de facturation. Fonctionne uniquement en mode test.

⚠️ Toujours en mode **test** Stripe (jamais en mode live).

### Préparation

1. Aller sur [dashboard.stripe.com/test/test-clocks](https://dashboard.stripe.com/test/test-clocks)
2. Cliquer **« Create a test clock »**
3. Noter l'heure de départ (par défaut : maintenant)

### Étape 1 — Créer un client et un abonnement rattachés au test clock

1. Dans l'interface du test clock, cliquer **« Create customer »** : le client Stripe est rattaché à l'horloge.
2. Attacher une carte de test au client (`4242 4242 4242 4242`, date future, CVC quelconque).
3. Créer un abonnement pour ce client, avec un prix mensuel équivalent à celui d'une annonce de test sur Nestock, **ancré au 1er du mois suivant** (« Billing cycle anchor » = 1er du mois suivant à 00:00 heure de Paris, prorata activé), comme le fait le site. Par l'API : `billing_cycle_anchor` + `proration_behavior: create_prorations`.

**Alternative plus réaliste :** faire une vraie réservation de test sur `nestock.pro` (mode test) avec un compte locataire de test, et rattacher après coup le client Stripe généré à un test clock via l'API. Plus fidèle au parcours utilisateur, mais plus long à mettre en place ; la méthode manuelle suffit à valider la logique serveur.

**✅ Vérification à ce stade :**
- Dans Supabase, table `bookings` : créer (ou identifier) une ligne de réservation de test avec `stripe_subscription_id` = l'ID de l'abonnement créé, `status = 'active'`. Le locataire (`renter_id`) et le propriétaire de l'annonce doivent être des comptes de test dont on lit les e-mails.

### Étape 2 — Premier prélèvement

1. Dans l'interface du test clock, cliquer **« Advance clock »** et avancer de quelques minutes après la création de l'abonnement.

**✅ Vérifications :**
- Stripe → Webhooks → endpoint de test → tentatives récentes : `invoice.paid` en **200**.
- **Aucune** nouvelle ligne dans `invoices` : c'est normal. Le webhook ignore la 1re facture d'un abonnement (`billing_reason = subscription_create`), car dans le vrai parcours elle est traitée par `checkout.session.completed` (testé par T-PAY-01).
- Montant de la 1re facture = prix mensuel × jours restants du mois ÷ jours du mois (prorata).

### Étape 3 — Prélèvement du 1er du mois

1. Avancer le test clock au **1er du mois suivant**, quelques heures après minuit (heure de Paris).

**✅ Vérifications :**
- `invoice.paid` (renouvellement) en **200** dans les tentatives récentes du webhook.
- Supabase, table `invoices` : nouvelle ligne `status = 'paid'`, `stripe_payment_id` renseigné (`pi_…`).
- E-mail « Quittance de loyer mensuelle » reçu par le locataire, « Paiement mensuel reçu » par le propriétaire.
- Notifications « Loyer prélevé » (locataire) et « Loyer reçu » (propriétaire).
- Stripe → Connect → compte du propriétaire : transfert égal à son loyer exact (mois entier).

### Étape 4 — Déclencher le préavis

1. Se connecter sur le site avec le compte locataire ou propriétaire de test et cliquer **« Résilier »** depuis le Dashboard.
   Ou par l'API :
   ```bash
   curl -X POST https://www.nestock.pro/api/bookings/{BOOKING_ID}/status \
     -H "Content-Type: application/json" \
     -H "Cookie: [session Supabase]" \
     -d '{"status": "ending"}'
   ```
2. Ouvrir immédiatement l'abonnement dans Stripe.

**✅ Vérifications :**
- Supabase : `bookings.status = 'ending'`, `notice_initiated_at` renseigné, `ending_date` = dernier jour du mois en cours (préavis jusqu'au 15 inclus) ou du mois suivant (après le 15), à 23:59:59 heure de Paris. Attention : la règle utilise la date **réelle** du serveur, pas celle du test clock.
- Stripe : l'abonnement affiche **« Cancels on [1er du mois qui suit la fin] »**.
- Stripe : **aucune** ligne de prorata ni avoir créé sur le client à ce moment-là.
- Notification + e-mail de préavis reçus par l'autre partie.

### Étape 5 — Fin de la location, sans remboursement

**C'est le cœur du test** : `cancel_at` arrête-t-il l'abonnement pile à la fin d'une période payée, sans facture ni remboursement ?

1. Avancer le test clock **au-delà du 1er du mois qui suit la fin** (date du `cancel_at`). Si un autre 1er du mois tombe avant (préavis donné après le 15), Stripe prélève d'abord ce mois entier : c'est voulu, il est dû.

**✅ Vérifications :**
- `customer.subscription.deleted` en **200** dans les tentatives récentes du webhook.
- **Aucune** facture datée du 1er du mois qui suit la fin ; abonnement « Canceled ».
- **Aucun remboursement** dans Stripe → Paiements ; aucune reprise sur les transferts du propriétaire ; aucun e-mail « Remboursement au prorata ».
- Stripe → client : **solde à 0 €**, aucun avoir, aucune ligne « Unused time… ».

### Étape 6 — Clôture par le cron

Le cron `/api/cron/end-bookings` tourne une fois par jour (2 h du matin). Il compare `ending_date` à la date **réelle** du serveur, pas à celle du test clock : on le déclenche à la main.

```bash
curl -X GET https://www.nestock.pro/api/cron/end-bookings \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

Si `ending_date` est encore dans le futur réel, modifier temporairement `ending_date` de la ligne de test dans Supabase (date passée) avant l'appel.

**✅ Vérifications :**
- Réponse JSON avec `processed: 1` (ou plus) et le détail du traitement.
- `bookings.status = 'ended'` dans Supabase.
- Notification + e-mail de fin de location reçus par les deux parties.
- L'annonce redevient visible et disponible.

### Nettoyage après le test

1. Supprimer le test clock depuis le tableau de bord Stripe (ça supprime aussi le client et l'abonnement de test associés).
2. Supprimer les lignes de test dans `bookings` et `invoices` dans Supabase, pour ne pas fausser les données ni les statistiques.

### Points d'échec probables à surveiller

- **Aucun événement n'arrive au webhook** : vérifier que le test clock est en mode test et que l'endpoint est configuré côté test dans Stripe. Si les événements arrivent en **400** : `STRIPE_WEBHOOK_SECRET` sur Vercel ne correspond pas à la clé `whsec_` de l'endpoint de test.
- **Pas de quittance au 2e mois** : vérifier dans les logs Vercel que la réservation est trouvée (`bookings.stripe_subscription_id` doit être exactement l'ID de l'abonnement, `sub_…`).
- **`stripe_payment_id` vide** : chercher « paiement introuvable pour la facture » dans les logs Vercel.
- **Une facture le 1er du mois qui suit la fin** : `cancel_at` ne tombe pas pile sur la fin de période ; vérifier que l'abonnement est bien ancré au 1er (`billing_cycle_anchor`) et que `cancel_at` = 1er du mois à 00:00 heure de Paris.
- **Un remboursement apparaît** : version du site antérieure au 19/10/2026 (le remboursement au prorata a été supprimé).
- **Avoir présent sur le client** : l'annulation a été programmée sans `proration_behavior: 'none'` (version du site antérieure au commit e766249).

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
