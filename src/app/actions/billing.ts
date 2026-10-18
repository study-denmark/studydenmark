"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getOrCreateCustomer, syncSubscription } from "@/lib/billing";
import { getSession } from "@/lib/auth";
import { isPlan } from "@/lib/plans";
import { priceIdFor } from "@/lib/stripe-prices";

async function baseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

export async function startCheckout(formData: FormData) {
  const raw = formData.get("plan");
  const plan = isPlan(raw) ? raw : "basic";
  const { user, plan: current } = await getSession();
  if (!user) redirect(`/login?next=/subscribe?plan=${plan}`);
  if (current === "premium" || (current === "basic" && plan === "basic")) redirect("/dashboard");
  if (current === "basic" && plan === "premium") redirect("/upgrade");

  const customer = await getOrCreateCustomer(user.id, user.email!);
  const url = await baseUrl();

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    line_items: [{ price: priceIdFor(plan), quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id, plan } },
    allow_promotion_codes: true,
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    customer_update:
      process.env.STRIPE_AUTOMATIC_TAX === "true" ? { address: "auto" } : undefined,
    success_url: `${url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}/subscribe?plan=${plan}&canceled=1`,
  });

  redirect(session.url!);
}

/**
 * Basic → Premium. Swaps the price on the existing Stripe subscription and charges only the
 * difference for the rest of the year right away. The change only applies if that payment succeeds.
 */
export async function upgradeToPremium() {
  const { user, plan, subscription } = await getSession();
  if (!user) redirect("/login?next=/upgrade");
  if (plan === "premium") redirect("/dashboard/documents");
  if (plan !== "basic" || !subscription) redirect("/subscribe?plan=premium");

  // Memberships granted manually by an admin have no Stripe subscription to change
  if (subscription.stripe_subscription_id.startsWith("manual_")) {
    return startCheckoutFresh(user.id, user.email!);
  }

  const s = stripe();
  const sub = await s.subscriptions.retrieve(subscription.stripe_subscription_id);
  const item = sub.items.data[0];
  let updated;
  try {
    updated = await s.subscriptions.update(sub.id, {
      items: [{ id: item.id, price: priceIdFor("premium") }],
      proration_behavior: "always_invoice",
      payment_behavior: "pending_if_incomplete",
    });
  } catch (e) {
    console.error("[billing] upgrade failed", e);
    redirect("/upgrade?error=payment");
  }
  if (updated.pending_update) redirect("/upgrade?error=payment");
  await syncSubscription(updated);
  redirect("/dashboard/documents?upgraded=1");
}

async function startCheckoutFresh(userId: string, email: string) {
  const customer = await getOrCreateCustomer(userId, email);
  const url = await baseUrl();
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: userId,
    line_items: [{ price: priceIdFor("premium"), quantity: 1 }],
    subscription_data: { metadata: { user_id: userId, plan: "premium" } },
    allow_promotion_codes: true,
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    success_url: `${url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}/upgrade?canceled=1`,
  });
  redirect(session.url!);
}

export async function openBillingPortal() {
  const { user, profile } = await getSession();
  if (!user) redirect("/login?next=/account");
  if (!profile?.stripe_customer_id) redirect("/subscribe");

  const portal = await stripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${await baseUrl()}/account`,
  });
  redirect(portal.url);
}
