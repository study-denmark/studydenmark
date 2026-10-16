"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getOrCreateCustomer } from "@/lib/billing";
import { getSession } from "@/lib/auth";

async function baseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

export async function startCheckout() {
  const { user, isActive } = await getSession();
  if (!user) redirect("/login?next=/subscribe");
  if (isActive) redirect("/dashboard");

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error("STRIPE_PRICE_ID is not set");

  const customer = await getOrCreateCustomer(user.id, user.email!);
  const url = await baseUrl();

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: true,
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    customer_update:
      process.env.STRIPE_AUTOMATIC_TAX === "true" ? { address: "auto" } : undefined,
    success_url: `${url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}/subscribe?canceled=1`,
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
