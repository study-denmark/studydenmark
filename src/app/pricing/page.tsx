import type { Metadata } from "next";
import { site } from "@/config/site";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Pricing" };

const free = [
  "Guide to studying in Denmark",
  "EU vs. non-EU rules",
  "Key deadlines",
  "Eligibility check",
];

const member = [
  "Full database of English-taught programmes",
  "Personal matches based on your profile",
  "Requirements, tuition and deadlines per programme",
  "Document checklist for your chosen programmes",
  "Secure document upload and review",
  "Help applying to partner schools – no extra fee",
];

export default function PricingPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">One price. Everything included.</h1>
        <p className="mt-5 text-lg text-ink-soft">
          No hidden fees and no commission charged to you. Cancel any time from your account.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-8">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold">€0</p>
          <p className="mt-1 text-sm text-muted">No account needed</p>
          <ul className="mt-8 space-y-3 text-[15px]">
            {free.map((f) => (
              <li key={f} className="flex gap-3"><Tick /> {f}</li>
            ))}
          </ul>
          <ButtonLink href="/eligibility" variant="ghost" className="mt-8 w-full">
            Check eligibility
          </ButtonLink>
        </div>

        <div className="relative rounded-[var(--radius-card)] border-2 border-ink bg-surface p-8">
          <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
            Most students choose this
          </span>
          <h2 className="text-xl font-semibold">Member</h2>
          <p className="mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold">
            {site.price.amountLabel}
          </p>
          <p className="mt-1 text-sm text-muted">
            per {site.price.interval} · {site.price.approxEur} · renews yearly
          </p>
          <ul className="mt-8 space-y-3 text-[15px]">
            {member.map((f) => (
              <li key={f} className="flex gap-3"><Tick /> {f}</li>
            ))}
          </ul>
          <ButtonLink href="/signup" className="mt-8 w-full">
            Get started
          </ButtonLink>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-line bg-surface px-6 py-5 text-[15px] text-ink-soft">
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

function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="mt-0.5 shrink-0" aria-hidden>
      <path d="M4 9.5l3 3 7-7" fill="none" stroke="#2F5D62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
