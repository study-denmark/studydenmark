import type { Metadata } from "next";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { PlanCard, Tick } from "@/components/plan-card";

export const metadata: Metadata = { title: "Pricing" };

const free = [
  "Study guide for each country",
  "EU vs. non-EU rules",
  "Key deadlines",
  "Eligibility check",
];

export default function PricingPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Find your programme. Get help applying.</h1>
        <p className="mt-5 text-lg text-ink-soft">
          No hidden fees and no commission charged to you. Upgrade from Basic to Premium any time – you only pay the
          difference.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
        <div className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-7 sm:p-8">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-1 text-[15px] text-ink-soft">The basics, no account needed.</p>
          <p className="mt-5 font-[family-name:var(--font-display)] text-5xl font-semibold">€0</p>
          <p className="mt-1 text-sm text-muted">No account needed</p>
          <ul className="mt-7 space-y-3 text-[15px]">
            {free.map((f) => (
              <li key={f} className="flex gap-3"><Tick /> {f}</li>
            ))}
          </ul>
          <div className="mt-auto pt-8">
            <ButtonLink href="/denmark/eligibility" variant="ghost" className="w-full">Check eligibility</ButtonLink>
          </div>
        </div>

        <PlanCard plan="basic">
          <ButtonLink href="/signup?plan=basic" variant="ghost" className="w-full">Choose Basic</ButtonLink>
        </PlanCard>

        <PlanCard plan="premium" highlight>
          <ButtonLink href="/signup?plan=premium" className="w-full">Choose Premium</ButtonLink>
        </PlanCard>
      </div>

      <p className="mt-6 text-center text-sm text-muted">Admission decisions are always made by the schools.</p>

      <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-line bg-surface px-6 py-5 text-[15px] text-ink-soft">
        <p className="font-semibold text-ink">How we make money</p>
        <p className="mt-1">
          Your membership fee, plus a referral fee from some schools when a student we helped enrols. Those
          schools are always marked <strong className="text-accent">Partner</strong>. You never pay more, and
          we show you every programme you qualify for – not only partner schools.
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-muted">Secure payment by Stripe. Card, Apple Pay and Google Pay accepted.</p>
    </Container>
  );
}
