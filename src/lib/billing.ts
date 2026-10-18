import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { planForItem } from "@/lib/stripe-prices";

const toIso = (unix?: number | null) => (unix ? new Date(unix * 1000).toISOString() : null);

function customerId(c: string | Stripe.Customer | Stripe.DeletedCustomer) {
  return typeof c === "string" ? c : c.id;
}

/** Find our user for a Stripe subscription: metadata first, then customer id. */
async function resolveUserId(sub: Stripe.Subscription): Promise<string | null> {
  const fromMeta = sub.metadata?.user_id;
  if (fromMeta) return fromMeta;
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId(sub.customer))
    .maybeSingle();
  return data?.id ?? null;
}

/** Idempotent upsert of a Stripe subscription into public.subscriptions. */
export async function syncSubscription(subOrId: Stripe.Subscription | string) {
  const sub =
    typeof subOrId === "string" ? await stripe().subscriptions.retrieve(subOrId) : subOrId;
  const userId = await resolveUserId(sub);
  if (!userId) {
    console.error("[billing] no user for subscription", sub.id);
    return;
  }
  // Since Stripe API 2025-03-31 the billing period lives on the subscription item.
  const item = sub.items.data[0];
  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId(sub.customer),
      stripe_price_id: item?.price.id ?? null,
      plan: planForItem(item),
      status: sub.status,
      current_period_start: toIso(item?.current_period_start),
      current_period_end: toIso(item?.current_period_end),
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" },
  );
  if (error) throw error;
}

/** Record a paid/failed invoice for the admin payment overview. */
export async function recordInvoice(invoice: Stripe.Invoice) {
  if (!invoice.id || !invoice.customer) return;
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId(invoice.customer))
    .maybeSingle();

  const { error } = await admin.from("payments").upsert(
    {
      user_id: profile?.id ?? null,
      stripe_invoice_id: invoice.id,
      amount_cents: invoice.amount_paid || invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status ?? "unknown",
      paid_at: toIso(invoice.status_transitions?.paid_at),
    },
    { onConflict: "stripe_invoice_id" },
  );
  if (error) throw error;
}

/** Get or create the Stripe customer for a user and store it on the profile. */
export async function getOrCreateCustomer(userId: string, email: string) {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, full_name")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) return profile.stripe_customer_id as string;

  const customer = await stripe().customers.create({
    email,
    name: profile?.full_name ?? undefined,
    metadata: { user_id: userId },
  });
  await admin.from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId);
  return customer.id;
}
