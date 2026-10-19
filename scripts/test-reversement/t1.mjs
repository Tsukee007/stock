import { db, stripe, state, postSignedEvent, wait } from "./common.mjs";
// 1er paiement (au prorata des jours restants du mois) → reversement au propriétaire dans la même proportion
const inv = await stripe.invoices.retrieve(state.firstInvoice);
const r = await postSignedEvent("checkout.session.completed", {
  id: "cs_test_local",
  object: "checkout.session",
  mode: "subscription",
  metadata: { bookingId: state.booking, contractId: state.contract },
  subscription: state.subscription,
  invoice: state.firstInvoice,
  payment_intent: null,
  amount_total: inv.amount_paid,
});
console.log("webhook :", r);
await wait(1500);
const { data: b } = await db.from("bookings").select("status, stripe_subscription_id").eq("id", state.booking).single();
console.log("réservation :", b.status, b.stripe_subscription_id === state.subscription ? "(abonnement relié)" : "");
const tr = await stripe.transfers.list({ transfer_group: "booking_" + state.booking });
const attendu = Math.round(5000 * Math.min(1, inv.amount_paid / Math.round(state.priceTtc * 100)));
console.log(
  "1er paiement :", inv.amount_paid / 100, "€ sur", state.priceTtc, "€ ;",
  "reversement :", tr.data.map((t) => t.amount / 100 + "€"), "; attendu", attendu / 100, "€",
  tr.data.length === 1 && tr.data[0].amount === attendu ? "OK" : "ÉCHEC",
);
