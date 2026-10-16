import type { Metadata } from "next";
import { getStudentContext } from "@/lib/programmes";
import { matchProgramme } from "@/lib/matching";
import { ProgrammeCard } from "@/components/programme-card";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "Saved programmes" };

export default async function SavedPage() {
  const { profile, programmes, savedIds } = await getStudentContext();
  const saved = programmes
    .filter((p) => savedIds.has(p.id))
    .map((p) => matchProgramme(p, profile))
    .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));

  return (
    <div>
      <h1 className="text-3xl font-semibold sm:text-4xl">Saved programmes</h1>
      <p className="mt-2 text-ink-soft">Your shortlist, sorted by deadline. You’ll apply to these from here.</p>
      {saved.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {saved.map((m) => (
            <ProgrammeCard key={m.programme.id} match={m} saved />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line bg-surface px-6 py-12 text-center">
          <p className="font-semibold">Nothing saved yet</p>
          <p className="mt-2 text-sm text-ink-soft">Tap the bookmark on any programme to add it to your shortlist.</p>
          <ButtonLink href="/dashboard/programmes" className="mt-6">Browse programmes</ButtonLink>
        </div>
      )}
    </div>
  );
}
