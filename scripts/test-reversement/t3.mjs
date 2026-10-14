import { db, stripe, state, wait } from "./common.mjs";
const clock = await stripe.testHelpers.testClocks.retrieve(state.clock);
const ending = new Date((clock.frozen_time + 10 * 86400) * 1000);
await db
  .from("bookings")
  .update({
    status: "ending",
    ending_date: ending.toISOString(),
    notice_initiated_by: "renter",
  })
  .eq("id", state.booking);
await stripe.subscriptions.cancel(state.subscription);
await wait(12000);
const refunds = await stripe.refunds.list({ limit: 5 });
const mine = refunds.data.filter(
  (r) => r.created >= Math.floor(Date.now() / 1000) - 120,
);
console.log(
  "remboursements :",
  mine.map((r) => r.amount / 100 + "€ " + r.status),
);
console.log(
  "attendu ≈",
  (56.08 * (1 - 10 / 30)).toFixed(2),
  "€ à",
  (56.08 * (1 - 10 / 31)).toFixed(2),
  "€ (20 jours non utilisés)",
);
