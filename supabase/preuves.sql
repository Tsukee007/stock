-- Preuves en cas de contestation (19/10/2026) : navigateur et version des CGU acceptée à la signature,
-- date de la demande de résiliation. Colonnes facultatives, rien d'existant n'est modifié.
-- À lancer dans le SQL Editor de chaque base (Nestock-tests et prod). Relançable sans risque.

alter table public.contracts
  add column if not exists owner_user_agent text,
  add column if not exists renter_user_agent text,
  add column if not exists owner_cgu_version text,
  add column if not exists renter_cgu_version text;

alter table public.bookings
  add column if not exists notice_initiated_at timestamptz;
