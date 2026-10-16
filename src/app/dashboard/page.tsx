import type { Metadata } from "next";
import Link from "next/link";
import { getStudentContext } from "@/lib/programmes";
import { rankMatches } from "@/lib/matching";
import { countryName, EDUCATION_LEVELS, eligibleLevels } from "@/lib/constants";
import { levelLabels } from "@/lib/labels";
import { ProgrammeCard } from "@/components/programme-card";
import { ButtonLink, Callout, Card } from "@/components/ui";

export const metadata: Metadata = { title: "My dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { profile, programmes, savedIds } = await getStudentContext();
  const { welcome } = await searchParams;
  const firstName = profile.full_name?.split(" ")[0];

  if (!profile.onboarding_completed_at) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">{firstName ? `Welcome, ${firstName}` : "Welcome"} 👋</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Answer a few questions about yourself and we’ll show you every English-taught programme you can apply for.
        </p>
        <ButtonLink href="/onboarding" variant="accent" className="mt-8">
          Build my profile – 3 minutes
        </ButtonLink>
      </div>
    );
  }

  const matches = rankMatches(programmes, profile);
  const top = matches.slice(0, 6);
  const strong = matches.filter((m) => m.tier === "strong").length;
  const nextDeadline = matches
    .map((m) => m.deadline)
    .filter((d): d is string => !!d && new Date(d) >= new Date(new Date().toDateString()))
    .sort()[0];
  const levels = eligibleLevels(profile.education_level);

  return (
    <div className="space-y-10">
      {welcome && (
        <Callout>
          <strong>Your profile is ready.</strong> Below are the programmes that fit you best. Save the ones you like – we’ll
          use them to build your document checklist.
        </Callout>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{firstName ? `Hi ${firstName}` : "Your matches"}</h1>
          <p className="mt-2 text-ink-soft">
            {matches.length > 0
              ? `${matches.length} programme${matches.length === 1 ? "" : "s"} fit your education level${strong ? ` – ${strong} strong match${strong === 1 ? "" : "es"}` : ""}.`
              : "We’re still adding programmes for your profile."}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat k="Matching programmes" v={String(matches.length)} />
            <Stat k="Saved" v={String(savedIds.size)} />
            <Stat
              k="Next deadline"
              v={nextDeadline ? new Date(nextDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
              className="col-span-2 sm:col-span-1"
            />
          </dl>
        </div>

        <Card className="self-start">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your profile</h2>
            <Link href="/onboarding" className="text-sm text-sea underline underline-offset-4">Edit</Link>
          </div>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row k="Nationality" v={`${countryName(profile.nationality) ?? "—"}${profile.is_eu_eea ? " (EU/EEA)" : ""}`} />
            <Row k="Education" v={EDUCATION_LEVELS.find((e) => e.value === profile.education_level)?.label ?? "—"} />
            <Row k="Interest" v={profile.field_of_interest ?? "—"} />
            <Row
              k="English"
              v={profile.english_test_type === "none" ? "No test yet" : `${profile.english_test_type} ${profile.english_test_score ?? ""}`}
            />
            <Row k="Budget" v={profile.budget_eur_per_year != null ? `€${profile.budget_eur_per_year.toLocaleString("en")}/yr` : "Not set"} />
          </dl>
          <p className="mt-4 border-t border-line pt-4 text-xs text-muted">
            You can apply for: {levels.map((l) => levelLabels[l]).join(", ")}
          </p>
        </Card>
      </div>

      {profile.english_test_type === "none" && (
        <Callout tone="warn">
          <strong>Book your English test.</strong> Almost every programme requires IELTS, TOEFL or similar – and some want
          the result by 15 March.
        </Callout>
      )}

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">Best matches for you</h2>
          {matches.length > top.length && (
            <Link href="/dashboard/programmes" className="shrink-0 text-sm text-sea underline underline-offset-4">
              See all {matches.length}
            </Link>
          )}
        </div>
        {top.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {top.map((m) => (
              <ProgrammeCard key={m.programme.id} match={m} saved={savedIds.has(m.programme.id)} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
        <p className="mt-6 text-xs text-muted">
          How we rank: field of interest, English requirement, budget and open deadline. Partner schools get a small
          boost and are always marked “Partner”.
        </p>
      </section>
    </div>
  );
}

function Stat({ k, v, className = "" }: { k: string; v: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-surface px-4 py-3 ${className}`}>
      <dt className="text-xs text-muted">{k}</dt>
      <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">{v}</dd>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-line bg-surface px-6 py-12 text-center">
      <p className="font-semibold">No matching programmes yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
        We’re adding new English-taught programmes all the time. Check back soon, or try updating your profile if
        your plans have changed.
      </p>
    </div>
  );
}
