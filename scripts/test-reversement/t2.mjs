import { db, stripe, state, wait } from "./common.mjs";
const clock = await stripe.testHelpers.testClocks.retrieve(state.clock);
await stripe.testHelpers.testClocks.advance(state.clock, {
  frozen_time: clock.frozen_time + 32 * 86400,
});
for (let i = 0; i < 40; i++) {
  await wait(3000);
  if (
    (await stripe.testHelpers.testClocks.retrieve(state.clock)).status ===
    "ready"
  )
    break;
}
await wait(8000);
const invs = await stripe.invoices.list({ subscription: state.subscription });
console.log(
  "factures Stripe :",
  invs.data.map(
    (i) => i.billing_reason + " " + i.status + " " + i.amount_paid / 100 + "€",
  ),
);
const { data: rows } = await db
  .from("invoices")
  .select("amount")
  .eq("booking_id", state.booking);
console.log("factures en base :", rows.length);
