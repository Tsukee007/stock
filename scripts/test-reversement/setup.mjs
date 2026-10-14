import { db, stripe, state, save, userId } from "./common.mjs";
const owner = await userId("proprietaire@nestock.pro");
const renter = await userId("locataire@nestock.pro");
state.owner = owner;
state.renter = renter;
state.expressAccount = "acct_1UQZ8sR85GinVc2x";
await db
  .from("profiles")
  .update({ stripe_account_id: state.expressAccount })
  .eq("id", owner);

const { data: model } = await db.from("spaces").select("*").limit(1).single();
const { id, created_at, ...rest } = model;
const priceTtc = Math.round(50 * 1.1 * 1.015 * 100 + 25) / 100;
const { data: space, error: e1 } = await db
  .from("spaces")
  .insert({
    ...rest,
    owner_id: owner,
    title: "Garage TEST reversement",
    price_month: 50,
    price_ttc: priceTtc,
    is_active: false,
  })
  .select()
  .single();
if (e1) throw e1;
const today = new Date().toISOString().slice(0, 10);
const { data: booking, error: e2 } = await db
  .from("bookings")
  .insert({
    space_id: space.id,
    renter_id: renter,
    start_date: today,
    price_month: 50,
    status: "awaiting_signature",
  })
  .select()
  .single();
if (e2) throw e2;
const now = new Date().toISOString();
const { data: contract, error: e3 } = await db
  .from("contracts")
  .insert({
    booking_id: booking.id,
    space_id: space.id,
    owner_id: owner,
    renter_id: renter,
    loyer_ht: 50,
    loyer_ttc: priceTtc,
    date_debut: today,
    owner_signed: true,
    owner_signed_at: now,
    owner_signature_name: "Proprietaire Test",
    renter_signed: true,
    renter_signed_at: now,
    renter_signature_name: "Locataire Test",
    status: "fully_signed",
  })
  .select()
  .single();
if (e3) throw e3;
Object.assign(state, {
  space: space.id,
  booking: booking.id,
  contract: contract.id,
  priceTtc,
});

const clock = await stripe.testHelpers.testClocks.create({
  frozen_time: Math.floor(Date.now() / 1000),
  name: "Nestock reversement 14-10",
});
const customer = await stripe.customers.create({
  email: "locataire@nestock.pro",
  name: "Locataire Test",
  test_clock: clock.id,
  payment_method: "pm_card_visa",
  invoice_settings: { default_payment_method: undefined },
});
const pm = (await stripe.paymentMethods.list({ customer: customer.id }))
  .data[0];
await stripe.customers.update(customer.id, {
  invoice_settings: { default_payment_method: pm.id },
});
const product = await stripe.products.create({
  name: "Location - Garage TEST reversement",
});
const sub = await stripe.subscriptions.create({
  customer: customer.id,
  items: [
    {
      price_data: {
        currency: "eur",
        product: product.id,
        unit_amount: Math.round(priceTtc * 100),
        recurring: { interval: "month" },
      },
    },
  ],
  metadata: { bookingId: booking.id, contractId: contract.id },
});
Object.assign(state, {
  clock: clock.id,
  customer: customer.id,
  subscription: sub.id,
  firstInvoice: sub.latest_invoice,
});
save();
const inv = await stripe.invoices.retrieve(sub.latest_invoice);
console.log(
  "espace/réservation/contrat créés ; abonnement",
  sub.status,
  "; 1re facture",
  inv.status,
  inv.amount_paid / 100,
  "€",
);
