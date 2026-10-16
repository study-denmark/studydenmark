import type { Metadata } from "next";
import Link from "next/link";
import { requireSubscriber } from "@/lib/auth";
import { Card, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "My dashboard" };

const steps = [
  {
    title: "Complete your profile",
    body: "Nationality, education, English score and budget – so we can match you.",
    status: "Coming next",
  },
  {
    title: "Explore your matches",
    body: "Every English-taught programme you qualify for, with requirements and deadlines.",
    status: "Coming next",
  },
  {
    title: "Upload your documents",
    body: "Passport, diplomas, transcripts and test results – checked by our team.",
    status: "Coming soon",
  },
  {
    title: "Apply with our help",
    body: "Choose the programmes you want to apply for, and we’ll take it from there.",
    status: "Coming soon",
  },
];

export default async function DashboardPage() {
  const { profile, subscription } = await requireSubscriber();
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <Container className="py-12 sm:py-16">
      <Eyebrow>My dashboard</Eyebrow>
      <h1 className="text-3xl font-semibold sm:text-4xl">{firstName ? `Hi ${firstName}` : "Welcome"} 👋</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Your membership is active
        {subscription?.current_period_end &&
          ` until ${new Date(subscription.current_period_end).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
        . Here’s your path to studying in Denmark.
      </p>

      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Card className="h-full">
              <div className="flex items-start justify-between gap-4">
                <span className="font-[family-name:var(--font-display)] text-2xl text-accent">0{i + 1}</span>
                <span className="rounded-full bg-paper px-2.5 py-1 text-xs text-muted">{s.status}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 text-[15px] text-ink-soft">{s.body}</p>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/deadlines" className="rounded-[var(--radius-card)] border border-line bg-surface p-6 hover:border-ink/30">
          <p className="font-semibold">Key deadlines</p>
          <p className="mt-1 text-sm text-ink-soft">15 March, 12:00 noon is the big one for most international applicants.</p>
        </Link>
        <Link href="/account" className="rounded-[var(--radius-card)] border border-line bg-surface p-6 hover:border-ink/30">
          <p className="font-semibold">Account & privacy</p>
          <p className="mt-1 text-sm text-ink-soft">Manage your membership, download or delete your data.</p>
        </Link>
      </div>
    </Container>
  );
}
