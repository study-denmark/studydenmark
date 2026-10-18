import "server-only";
import type Stripe from "stripe";
import type { Plan } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

// Each plan can be configured with either a product id (prod_..., we then use its default price)
// or a price id (price_...). STRIPE_PRICE_ID is kept as a fallback for Basic.
const env = (plan: Plan) =>
  plan === "premium"
    ? { product: process.env.STRIPE_PRODUCT_ID_PREMIUM, price: process.env.STRIPE_PRICE_ID_PREMIUM }
    : { product: process.env.STRIPE_PRODUCT_ID_BASIC, price: process.env.STRIPE_PRICE_ID_BASIC ?? process.env.STRIPE_PRICE_ID };

const cache = new Map<Plan, string>();

/** Stripe price id to charge for a plan. */
export async function priceIdFor(plan: Plan): Promise<string> {
  const cached = cache.get(plan);
  if (cached) return cached;
  const { product, price } = env(plan);
  let id = price;
  if (!id && product) {
    const p = await stripe().products.retrieve(product);
    id = typeof p.default_price === "string" ? p.default_price : p.default_price?.id;
  }
  if (!id) throw new Error(`Stripe price for plan "${plan}" is not set`);
  cache.set(plan, id);
  return id;
}

/** Which plan a Stripe subscription item belongs to. Unknown prices count as Basic. */
export function planForItem(item: Stripe.SubscriptionItem | undefined): Plan {
  if (!item) return "basic";
  const { product, price } = env("premium");
  const productId = typeof item.price.product === "string" ? item.price.product : item.price.product?.id;
  if ((price && item.price.id === price) || (product && productId === product)) return "premium";
  return "basic";
}
