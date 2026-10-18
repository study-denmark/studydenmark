import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { upgradeToPremium } from "@/app/actions/billing";
import { site } from "@/config/site";
import { Button, Callout, Container } from "@/components/ui";
import { PlanCard } from "@/components/plan-card";

export const metadata: Metadata = { title: "Upgrade to Premium" };

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; canceled?: string }>;
}) {
  const { error, canceled } = await searchParams;
  const { user, plan, isPremium, subscription } = await getSession();
  if (!user) redirect("/login?next=/upgrade");
  if (isPremium) redirect("/dashboard/documents");
  if (plan !== "basic") redirect("/subscribe?plan=premium");

  const manual = subscription?.stripe_subscription_id.startsWith("manual_");

  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1fr_380px] md:items-start">
        <div>
          <Link href="/dashboard" className="text-sm text-muted hover:text-ink">← Dashboard</Link>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Let us help you apply</h1>
          <p className="mt-4 text-lg text-ink-soft">
            Basic shows you what you can study. With Premium we go through your documents, tell you exactly what’s
            missing and handle the application to the schools you choose.
          </p>
          {error === "payment" && (
            <div className="mt-6">
              <Callout tone="warn">
                The payment didn’t go through, so nothing changed. Check your card in your account and try again.
              </Callout>
            </div>
          )}
          {canceled && (
            <div className="mt-6">
              <Callout tone="warn">Payment was cancelled – nothing was charged.</Callout>
            </div>
          )}
          <div className="mt-8 rounded-xl border border-line bg-surface px-6 py-5 text-[15px] text-ink-soft">
            <p className="font-semibold text-ink">What it costs</p>
            {manual ? (
              <p className="mt-1">
                Premium is {site.plans.premium.amountLabel} per {site.plans.premium.interval}. You’ll be sent to Stripe to pay.
              </p>
            ) : (
              <p className="mt-1">
                You only pay the difference between Basic and Premium for the rest of your membership year – charged
                right away to the card you already use. After that, Premium renews at {site.plans.premium.amountLabel} per{" "}
                {site.plans.premium.interval}.
              </p>
            )}
          </div>
        </div>

        <PlanCard plan="premium" highlight>
          <form action={upgradeToPremium}>
            <Button type="submit" variant="accent" className="w-full">
              Upgrade to Premium
            </Button>
          </form>
        </PlanCard>
      </div>
    </Container>
  );
}
