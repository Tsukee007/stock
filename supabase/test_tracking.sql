-- Suivi des tests (page /admin-tests), alimenté par l'agent Testeur d'AI Framework
-- via POST /api/admin-tests/sync. À exécuter une fois dans Supabase → SQL Editor.
create table if not exists public.test_tracking (
  test_id     text primary key,          -- ex. T-NAV-03
  position    integer not null,          -- ordre du cahier de tests
  title       text not null,
  category    text,
  description text,                      -- ce que vérifie le test, en langage simple si disponible
  status      text not null,             -- À faire | En cours | OK | Échec | Partiel | Bloqué
  summary     text,                      -- résultat en langage simple (agent Testeur)
  details     text,                      -- détails techniques
  source      text,
  mission_id  integer,
  result_date text,
  synced_at   timestamptz not null default now()
);

-- RLS activée sans aucune politique : la table n'est lisible et modifiable
-- que côté serveur, avec la clé service (routes /api/admin-tests).
alter table public.test_tracking enable row level security;
