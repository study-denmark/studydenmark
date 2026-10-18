import "server-only";
import type { Plan } from "@/lib/plans";

/** Stripe price id per plan. STRIPE_PRICE_ID is kept as a fallback for Basic. */
export function priceIdFor(plan: Plan): string {
  const id =
    plan === "premium"
      ? process.env.STRIPE_PRICE_ID_PREMIUM
      : process.env.STRIPE_PRICE_ID_BASIC ?? process.env.STRIPE_PRICE_ID;
  if (!id) throw new Error(`Stripe price for plan "${plan}" is not set`);
  return id;
}

/** Which plan a Stripe price belongs to. Unknown prices count as Basic. */
export function planForPrice(priceId: string | null | undefined): Plan {
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_PREMIUM) return "premium";
  return "basic";
}
