import { db, stripe, state, postSignedEvent, wait } from "./common.mjs";
const r = await postSignedEvent("checkout.session.completed", {
  id: "cs_test_local",
  object: "checkout.session",
  mode: "subscription",
  metadata: { bookingId: state.booking, contractId: state.contract },
  subscription: state.subscription,
  invoice: state.firstInvoice,
  payment_intent: null,
  amount_total: Math.round(state.priceTtc * 100),
});
console.log("webhook :", r);
await wait(1500);
const { data: b } = await db
  .from("bookings")
  .select("status, stripe_subscription_id")
  .eq("id", state.booking)
  .single();
const { data: inv } = await db
  .from("invoices")
  .select("amount, stripe_payment_id")
  .eq("booking_id", state.booking);
console.log(
  "réservation :",
  b.status,
  b.stripe_subscription_id === state.subscription ? "(abonnement relié)" : "",
);
console.log(
  "factures en base :",
  inv.map(
    (i) =>
      i.amount +
      "€ " +
      (i.stripe_payment_id ? "paiement relié" : "SANS paiement"),
  ),
);
const tr = await stripe.transfers.list({
  transfer_group: "booking_" + state.booking,
});
console.log("transferts Stripe :", tr.data.length);
