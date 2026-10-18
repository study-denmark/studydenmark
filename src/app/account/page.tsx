import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { site } from "@/config/site";
import { openBillingPortal } from "@/app/actions/billing";
import { deleteAccount } from "@/app/actions/account";
import { subscriptionStatusLabels } from "@/lib/labels";
import { Button, ButtonLink, Callout, Card, Container, inputClass } from "@/components/ui";

export const metadata: Metadata = { title: "Account" };

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user, profile, subscription, isActive, plan } = await getSession();
  if (!user) redirect("/login?next=/account");
  const { error } = await searchParams;

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold sm:text-4xl">Account</h1>

        {error === "confirm" && <Callout tone="warn">Type DELETE in capital letters to confirm.</Callout>}
        {error === "delete" && <Callout tone="warn">Something went wrong deleting your account. Please contact us.</Callout>}

        <Card>
          <h2 className="text-lg font-semibold">Profile</h2>
          <dl className="mt-4 grid gap-3 text-[15px] sm:grid-cols-2">
            <div><dt className="text-sm text-muted">Name</dt><dd>{profile?.full_name ?? "—"}</dd></div>
            <div><dt className="text-sm text-muted">Email</dt><dd className="break-all">{user.email}</dd></div>
          </dl>
          <Link href="/account/password" className="mt-4 inline-block text-sm text-sea underline underline-offset-4">
            Change password
          </Link>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Membership</h2>
          {subscription ? (
            <div className="mt-4 text-[15px]">
              {plan && (
                <p className="mb-1">
                  Plan: <span className="font-medium">{site.plans[plan].name}</span>
                  <span className="text-ink-soft"> · {site.plans[plan].amountLabel}/{site.plans[plan].interval}</span>
                </p>
              )}
              <p>
                Status:{" "}
                <span className={`font-medium ${isActive ? "text-ok" : "text-accent"}`}>
                  {subscriptionStatusLabels[subscription.status] ?? subscription.status}
                </span>
              </p>
              {subscription.current_period_end && (
                <p className="mt-1 text-ink-soft">
                  {subscription.cancel_at_period_end ? "Ends" : "Renews"} on {fmt(subscription.current_period_end)}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {plan === "basic" && <ButtonLink href="/upgrade" variant="accent">Upgrade to Premium</ButtonLink>}
                {!subscription.stripe_subscription_id.startsWith("manual_") && (
                  <form action={openBillingPortal}>
                    <Button variant="ghost" type="submit">Manage payment & cancel</Button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-ink-soft">You don’t have a membership yet.</p>
              <ButtonLink href="/subscribe" className="mt-4">Activate membership</ButtonLink>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Your data</h2>
          <p className="mt-2 text-[15px] text-ink-soft">
            Download a copy of everything we store about you – profile, consents, documents list and who your
            documents have been shared with.
          </p>
          <a href="/api/account/export" className="mt-4 inline-flex rounded-full border border-line bg-surface px-5 py-3 text-[15px] font-medium hover:border-ink/40">
            Download my data
          </a>
        </Card>

        <Card className="border-accent/30">
          <h2 className="text-lg font-semibold">Delete account</h2>
          <p className="mt-2 text-[15px] text-ink-soft">
            Permanently deletes your account, profile and all uploaded documents, and cancels your membership.
            This can’t be undone. Payment records are kept for bookkeeping, without your personal details.
          </p>
          <form action={deleteAccount} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input name="confirm" placeholder="Type DELETE to confirm" className={`${inputClass} sm:max-w-60`} autoComplete="off" />
            <Button variant="accent" type="submit">Delete my account</Button>
          </form>
        </Card>

        <form action="/auth/signout" method="post">
          <Button variant="link" type="submit">Log out</Button>
        </form>
      </div>
    </Container>
  );
}
