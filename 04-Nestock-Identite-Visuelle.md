# Identité visuelle — Nestock

Version du 13/08/2026

## Positionnement

Nestock est la place de marché du stockage local entre particuliers — "l'Airbnb du stockage". Le ton doit rester sobre et rassurant : on parle d'accès à l'espace des gens (garages, caves, greniers) et d'argent qui transite entre eux.

## Concept

- **Bleu** : confiance, sécurité — cohérent avec les paiements Stripe et les contrats.
- **Terracotta** : le carton, le stockage, la chaleur du local.
- **Logo** : pictogramme toit (nest) + contour de carton (stock), combinés en un seul symbole simple.

## Palette

| Couleur | Hex | Usage |
|---|---|---|
| Bleu confiance | `#1D4ED8` | CTA principal, liens, actions |
| Terracotta carton | `#E86A33` | Accents, CTA secondaire |
| Anthracite | `#0F172A` | Titres, texte principal |
| Blanc cassé | `#F8FAFC` | Fonds |
| Gris ardoise | `#64748B` | Texte secondaire |

## Typographie

- **Titres** : Manrope, weight 500
- **Texte courant** : Inter, weight 400 (déjà utilisé par défaut avec Tailwind — aucune dépendance à ajouter)

## Valeurs de marque

Proximité · Confiance · Accessibilité · Impact local

## Ton de voix

- Vouvoiement, phrases courtes, pas de jargon technique.
- Pas de superlatifs non vérifiés ("100% sécurisé", "certifié PCI-DSS" — ces garanties appartiennent à Stripe, pas à Nestock).
- CTA à l'impératif, verbe en premier : "Réserver", "Publier une annonce", "Voir le local".

## Application UI

**Bouton principal**
- Fond `#1D4ED8`, texte blanc, radius 8px

**Bouton secondaire**
- Fond transparent, contour `#E86A33`, texte `#E86A33`

**Cards**
- Fond blanc, bordure fine grise, radius 12px, ombre nulle (design plat)

## À faire pour appliquer l'identité

- [ ] Décliner le logo en SVG (favicon + header)
- [ ] Mettre à jour `tailwind.config` avec les couleurs ci-dessus
- [ ] Vérifier le contraste AA sur boutons et badges
- [ ] Uniformiser landing page + dashboard + emails transactionnels