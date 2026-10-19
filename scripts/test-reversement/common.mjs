import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parseEnv } from "node:util";
import { createRequire } from "node:module";
const require = createRequire(`${process.cwd()}/package.json`);
const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");
export const env = parseEnv(readFileSync(".env.local", "utf8"));
if (
  !env.NEXT_PUBLIC_SUPABASE_URL.includes("wtaxoseypxoqhpaltdhh") ||
  !env.STRIPE_SECRET_KEY.startsWith("sk_test_")
) {
  console.error("STOP : pas en environnement de test");
  process.exit(1);
}
export const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
export const stripe = new (Stripe.default || Stripe)(env.STRIPE_SECRET_KEY);
const STATE = new URL("./state.json", import.meta.url);
export const state = existsSync(STATE)
  ? JSON.parse(readFileSync(STATE, "utf8"))
  : {};
export const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2));
export async function userId(email) {
  const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
  return data.users.find((u) => u.email === email).id;
}
export async function postSignedEvent(type, object) {
  const payload = JSON.stringify({
    id: "evt_test_local_" + Date.now(),
    object: "event",
    type,
    api_version: "2026-02-25.clover",
    created: Math.floor(Date.now() / 1000),
    data: { object },
    livemode: false,
  });
  const header = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: env.STRIPE_WEBHOOK_SECRET,
  });
  const res = await fetch("http://localhost:3000/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": header, "content-type": "application/json" },
    body: payload,
  });
  return res.status + " " + (await res.text());
}
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// 1er du mois suivant (ou + n mois) à minuit, heure de Paris, en secondes : même règle que lib/billing.ts
export function parisMonthStart(unix, monthsAhead = 1) {
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit" })
    .format(new Date(unix * 1000)).split("-").map(Number);
  const guess = Date.UTC(y, m - 1 + monthsAhead, 1);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Paris", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit" })
    .formatToParts(new Date(guess));
  const hour = Number(parts.find((p) => p.type === "hour").value);
  return Math.floor((guess - hour * 3600000) / 1000);
}
export async function advanceClock(to) {
  await stripe.testHelpers.testClocks.advance(state.clock, { frozen_time: to });
  for (let i = 0; i < 60; i++) {
    await wait(3000);
    if ((await stripe.testHelpers.testClocks.retrieve(state.clock)).status === "ready") break;
  }
  await wait(10000);
}
