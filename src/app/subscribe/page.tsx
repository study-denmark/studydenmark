import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { startCheckout } from "@/app/actions/billing";
import { Button, Callout, Container } from "@/components/ui";
import { PlanCard } from "@/components/plan-card";
import { PLANS, isPlan } from "@/lib/plans";

export const metadata: Metadata = { title: "Choose your membership" };

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; plan?: string }>;
}) {
  const { canceled, plan: wanted } = await searchParams;
  const { user, profile, plan } = await getSession();
  if (!user) redirect(`/login?next=/subscribe${isPlan(wanted) ? `?plan=${wanted}` : ""}`);
  if (profile?.role === "admin" || plan === "premium") redirect("/dashboard");
  if (plan === "basic") redirect(wanted === "premium" ? "/upgrade" : "/dashboard");
  const firstName = profile?.full_name?.split(" ")[0];
  const highlight = isPlan(wanted) ? wanted : "premium";

  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium text-sea">Step 2 of 2</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          {firstName ? `Welcome, ${firstName}.` : "Welcome."} Choose your membership.
        </h1>
        <p className="mt-3 text-ink-soft">
          Start with Basic and upgrade later if you want our help applying – you only pay the difference.
        </p>

        {canceled && (
          <div className="mt-6">
            <Callout tone="warn">Payment was cancelled – nothing was charged. You can try again below.</Callout>
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {PLANS.map((p) => (
            <PlanCard key={p} plan={p} highlight={p === highlight}>
              <form action={startCheckout}>
                <input type="hidden" name="plan" value={p} />
                <Button type="submit" variant={p === highlight ? "accent" : "ghost"} className="w-full">
                  Continue with {p === "premium" ? "Premium" : "Basic"}
                </Button>
              </form>
            </PlanCard>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          You’ll be sent to Stripe to pay. Renews yearly until you cancel. Cancel any time from your account.
        </p>
      </div>
    </Container>
  );
}
