// Crée (ou remet à jour) les comptes de test de Nestock dans la base Nestock-tests.
// Lancement : node scripts/create-test-accounts.mjs

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { parseEnv } from "node:util";
import { createClient } from "@supabase/supabase-js";

// 1. Lire les deux fichiers de réglages
//    - .env.local de Nestock : adresse de la base et clé de service (clé « tout-puissante »)
//    - .env de framework-ia : e-mails et mots de passe des comptes de test
const nestockEnv = parseEnv(readFileSync(".env.local", "utf8"));
const frameworkEnv = parseEnv(
  readFileSync(`${homedir()}/Developer/framework-ia/.env`, "utf8"),
);

const supabaseUrl = nestockEnv.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = nestockEnv.SUPABASE_SERVICE_ROLE_KEY;

// 2. Sécurité : on refuse de travailler ailleurs que sur la base de test
const TEST_PROJECT = "wtaxoseypxoqhpaltdhh";
if (!supabaseUrl?.includes(TEST_PROJECT)) {
  console.error(
    "Arrêt : .env.local ne pointe pas vers la base de test Nestock-tests.",
  );
  process.exit(1);
}
if (!serviceKey) {
  console.error("Arrêt : SUPABASE_SERVICE_ROLE_KEY est vide dans .env.local.");
  process.exit(1);
}

// 3. La liste des comptes à créer, construite à partir du .env de framework-ia
const accounts = [
  { role: "OWNER", fullName: "Propriétaire Test" },
  { role: "TENANT", fullName: "Locataire Test" },
  { role: "OTHER", fullName: "Autre Test" },
].map((account) => ({
  ...account,
  email: frameworkEnv[`TESTER_SECRET_${account.role}_EMAIL`],
  password: frameworkEnv[`TESTER_SECRET_${account.role}_PASSWORD`],
}));

console.log("Base de test :", supabaseUrl);
for (const account of accounts) {
  // On n'affiche jamais le mot de passe, seulement s'il a été trouvé
  console.log(
    `${account.role} : ${account.email} — mot de passe ${account.password ? "trouvé" : "MANQUANT"}`,
  );
}
if (accounts.some((account) => !account.email || !account.password)) {
  console.error(
    "Arrêt : il manque un e-mail ou un mot de passe dans le .env de framework-ia.",
  );
  process.exit(1);
}

// 4. Se connecter à la base avec la clé de service (droits d'administrateur)
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

// 5. Les comptes qui existent déjà, pour ne pas créer de doublon
const { data: existing, error: listError } =
  await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listError) {
  console.error(
    "Arrêt : impossible de lire les comptes existants —",
    listError.message,
  );
  process.exit(1);
}

// 6. Pour chaque compte : le créer, ou le remettre à jour s'il existe déjà
for (const account of accounts) {
  const settings = {
    password: account.password,
    email_confirm: true, // compte confirmé d'office, sans passer par l'e-mail
    user_metadata: { full_name: account.fullName },
  };
  const found = existing.users.find((user) => user.email === account.email);

  const { data, error } = found
    ? await supabase.auth.admin.updateUserById(found.id, settings)
    : await supabase.auth.admin.createUser({
        email: account.email,
        ...settings,
      });

  if (error) {
    console.error(`${account.role} : échec —`, error.message);
    continue;
  }

  // Le profil (table profiles) porte le nom affiché sur le site
  await supabase
    .from("profiles")
    .upsert({ id: data.user.id, full_name: account.fullName });

  console.log(`${account.role} : ${found ? "mis à jour" : "créé"}`);
}
