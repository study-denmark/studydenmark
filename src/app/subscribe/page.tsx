import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { startCheckout } from "@/app/actions/billing";
import { site } from "@/config/site";
import { Button, Callout, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Choose your membership" };

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { user, profile, isActive } = await getSession();
  if (!user) redirect("/login?next=/subscribe");
  if (isActive || profile?.role === "admin") redirect("/dashboard");
  const { canceled } = await searchParams;
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto max-w-lg">
        <p className="text-sm font-medium text-sea">Step 2 of 2</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          {firstName ? `Welcome, ${firstName}.` : "Welcome."} One last step.
        </h1>
        <p className="mt-3 text-ink-soft">Activate your membership to unlock your personal programme matches.</p>

        {canceled && (
          <div className="mt-6">
            <Callout tone="warn">Payment was cancelled – nothing was charged. You can try again below.</Callout>
          </div>
        )}

        <div className="mt-8 rounded-[var(--radius-card)] border-2 border-ink bg-surface p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Membership</h2>
            <p>
              <span className="font-[family-name:var(--font-display)] text-3xl font-semibold">{site.price.amountLabel}</span>
              <span className="text-muted"> / {site.price.interval}</span>
            </p>
          </div>
          <ul className="mt-6 space-y-2 text-[15px] text-ink-soft">
            <li>✓ All English-taught programmes, matched to you</li>
            <li>✓ Document checklist and secure upload</li>
            <li>✓ Help applying to partner schools</li>
            <li>✓ Cancel any time</li>
          </ul>
          <form action={startCheckout} className="mt-8">
            <Button type="submit" variant="accent" className="w-full">
              Continue to secure payment
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted">
            You’ll be sent to Stripe to pay. Renews yearly until you cancel.
          </p>
        </div>
      </div>
    </Container>
  );
}
