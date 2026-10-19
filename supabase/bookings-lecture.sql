-- Faille relevée le 19/10/2026 : la règle « API peut lire les réservations » (SELECT, true, rôle public)
-- laissait n'importe qui lire toutes les réservations avec la clé publique du site.
-- Le site lit désormais les disponibilités côté serveur (lib/availability.ts) : la règle n'est plus utile.
-- Restent : « Voir ses réservations » (locataire ou propriétaire de l'espace) et les accès serveur (clé service_role).
-- À lancer dans le SQL Editor de chaque base, APRÈS la mise en ligne du code qui utilise lib/availability.ts.

drop policy if exists "API peut lire les réservations" on public.bookings;
