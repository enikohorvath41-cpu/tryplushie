import Stripe from "stripe";

declare global {
  // eslint-disable-next-line no-var
  var __tryplushieStripe: Stripe | undefined;
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  if (!globalThis.__tryplushieStripe) {
    globalThis.__tryplushieStripe = new Stripe(secretKey);
  }

  return globalThis.__tryplushieStripe;
}
