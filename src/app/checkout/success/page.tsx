import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { syncSubscription } from "@/lib/billing";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Payment received" };

// Syncs the subscription right away instead of waiting for the webhook,
// so the user lands on an unlocked dashboard. The webhook remains the source of truth.
export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const { session_id } = await searchParams;

  let ok = false;
  if (session_id) {
    try {
      const session = await stripe().checkout.sessions.retrieve(session_id);
      if (session.client_reference_id === user.id && session.subscription) {
        await syncSubscription(
          typeof session.subscription === "string" ? session.subscription : session.subscription.id,
        );
        ok = session.status === "complete";
      }
    } catch (e) {
      console.error("[checkout] sync failed", e);
    }
  }

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sea-soft">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
            <path d="M6 13.5l4.5 4.5L20 8.5" fill="none" stroke="#3D6185" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">
          {ok ? "You’re in." : "Payment received"}
        </h1>
        <p className="mt-3 text-ink-soft">
          {ok
            ? "Your membership is active. A receipt is on its way to your inbox."
            : "We’re confirming your payment. This usually takes a few seconds – refresh your dashboard if it isn’t unlocked yet."}
        </p>
        <ButtonLink href="/dashboard" className="mt-8">
          Go to my dashboard
        </ButtonLink>
      </div>
    </Container>
  );
}
