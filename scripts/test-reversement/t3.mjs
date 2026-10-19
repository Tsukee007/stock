import { db, stripe, state, advanceClock, parisMonthStart, wait } from "./common.mjs";
// Préavis donné le 1er (≤ 15) → fin le dernier jour du mois, arrêt de l'abonnement le 1er suivant à minuit :
// aucun prélèvement en plus, aucun remboursement, aucune reprise au propriétaire
const clock = await stripe.testHelpers.testClocks.retrieve(state.clock);
const cancelAt = parisMonthStart(clock.frozen_time);
await db.from("bookings").update({
  status: "ending",
  ending_date: new Date((cancelAt - 1) * 1000).toISOString(),
  notice_initiated_by: "renter",
  notice_initiated_at: new Date(clock.frozen_time * 1000).toISOString(),
}).eq("id", state.booking);
await stripe.subscriptions.update(state.subscription, { cancel_at: cancelAt, proration_behavior: "none" });
await advanceClock(cancelAt + 2 * 3600);
await wait(5000);
const sub = await stripe.subscriptions.retrieve(state.subscription);
const invs = await stripe.invoices.list({ subscription: state.subscription });
const refunds = (await stripe.refunds.list({ limit: 10 })).data.filter((r) => r.created >= clock.created);
const tr = await stripe.transfers.list({ transfer_group: "booking_" + state.booking });
console.log("abonnement :", sub.status, sub.status === "canceled" ? "OK" : "ÉCHEC");
console.log("factures :", invs.data.length, invs.data.length === 2 ? "OK (pas de prélèvement après la fin)" : "ÉCHEC");
console.log("remboursements :", refunds.length, refunds.length === 0 ? "OK" : "ÉCHEC");
console.log("reprises au propriétaire :", tr.data.reduce((s, t) => s + t.amount_reversed, 0) / 100, "€", tr.data.every((t) => t.amount_reversed === 0) ? "OK" : "ÉCHEC");
