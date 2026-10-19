import { stripe, state, advanceClock, parisMonthStart } from "./common.mjs";
// Prélèvement du 1er du mois (mois entier) → 2e reversement de 50 €
const clock = await stripe.testHelpers.testClocks.retrieve(state.clock);
await advanceClock(parisMonthStart(clock.frozen_time) + 2 * 3600);
const invs = await stripe.invoices.list({ subscription: state.subscription });
console.log("factures Stripe :", invs.data.map((i) => i.billing_reason + " " + i.status + " " + i.amount_paid / 100 + "€ (" + new Date(i.period_end * 1000).toISOString().slice(0, 10) + ")"));
const tr = await stripe.transfers.list({ transfer_group: "booking_" + state.booking });
const full = tr.data.filter((t) => t.amount === 5000).length;
console.log("reversements :", tr.data.map((t) => t.amount / 100 + "€"), full === 1 ? "OK (un mois entier = 50 €)" : "ÉCHEC");
