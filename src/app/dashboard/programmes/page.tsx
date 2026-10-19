import type { Metadata } from "next";
import Link from "next/link";
import { getStudentContext } from "@/lib/programmes";
import { matchProgramme, type Match } from "@/lib/matching";
import { eligibleLevels, FIELDS, toIeltsBand } from "@/lib/constants";
import { levelLabels, type ProgrammeLevel } from "@/lib/labels";
import { ProgrammeCard } from "@/components/programme-card";
import { inputClass } from "@/components/ui";

export const metadata: Metadata = { title: "All programmes" };

type Search = {
  q?: string;
  level?: string;
  field?: string;
  city?: string;
  maxTuition?: string;
  english?: string; // "mine" = only where my score meets the requirement
  open?: string; // "1" = deadline not passed
  partner?: string; // "1"
  scope?: string; // "eligible" (default) | "all"
  sort?: string; // "match" | "deadline" | "tuition"
};

export default async function ProgrammesDatabase({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const { profile, programmes, savedIds } = await getStudentContext();
  const scope = sp.scope === "all" ? "all" : "eligible";
  const myLevels = eligibleLevels(profile.education_level);
  const myBand = toIeltsBand(profile.english_test_type, profile.english_test_score);
  const today = new Date(new Date().toDateString());

  const cities = [...new Set(programmes.map((p) => p.city))].sort();
  const fields = FIELDS.filter((f) => programmes.some((p) => p.field === f));

  let results: Match[] = programmes.map((p) => matchProgramme(p, profile));
  if (scope === "eligible" && profile.onboarding_completed_at) results = results.filter((m) => m.eligibleLevel);

  const q = sp.q?.trim().toLowerCase();
  if (q)
    results = results.filter((m) =>
      [m.programme.title, m.programme.institutions?.name, m.programme.field, m.programme.city]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q)),
    );
  if (sp.level) results = results.filter((m) => m.programme.level === sp.level);
  if (sp.field) results = results.filter((m) => m.programme.field === sp.field);
  if (sp.city) results = results.filter((m) => m.programme.city === sp.city);
  if (sp.maxTuition) {
    const max = Number(sp.maxTuition);
    results = results.filter((m) => m.tuition != null && m.tuition <= max);
  }
  if (sp.english === "mine" && myBand != null)
    results = results.filter((m) => m.programme.min_ielts == null || myBand >= m.programme.min_ielts);
  if (sp.open === "1") results = results.filter((m) => !m.deadline || new Date(m.deadline) >= today);
  if (sp.partner === "1") results = results.filter((m) => m.programme.institutions?.is_partner);

  const sort = sp.sort ?? "match";
  results.sort((a, b) => {
    if (sort === "deadline") return (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
    if (sort === "tuition") return (a.tuition ?? Infinity) - (b.tuition ?? Infinity);
    return (
      b.score - a.score ||
      Number(!!b.programme.institutions?.is_partner) - Number(!!a.programme.institutions?.is_partner) ||
      a.programme.title.localeCompare(b.programme.title)
    );
  });

  const activeFilters = Object.entries(sp).filter(([k, v]) => v && k !== "sort" && k !== "scope").length;
  const sel = `${inputClass} py-2.5 text-[15px]`;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">All programmes</h1>
          <p className="mt-2 text-ink-soft">
            {scope === "eligible" && profile.onboarding_completed_at
              ? `Showing programmes at your level (${myLevels.map((l) => levelLabels[l]).join(", ")}).`
              : "Showing every English-taught programme in our database."}{" "}
            {profile.onboarding_completed_at && (
            <Link
              href={{ query: { ...sp, scope: scope === "eligible" ? "all" : "eligible" } }}
              className="text-sea underline underline-offset-4"
            >
              {scope === "eligible" ? "Show all levels" : "Only my level"}
            </Link>
            )}
          </p>
        </div>
      </div>

      <form className="mt-6 grid gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input type="hidden" name="scope" value={scope} />
        <input name="q" defaultValue={sp.q} placeholder="Search programme, school, city…" className={`${sel} sm:col-span-2`} />
        <select name="level" defaultValue={sp.level ?? ""} className={sel} aria-label="Level">
          <option value="">All levels</option>
          {(Object.keys(levelLabels) as ProgrammeLevel[]).map((l) => (
            <option key={l} value={l}>{levelLabels[l]}</option>
          ))}
        </select>
        <select name="field" defaultValue={sp.field ?? ""} className={sel} aria-label="Field">
          <option value="">All fields</option>
          {fields.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select name="city" defaultValue={sp.city ?? ""} className={sel} aria-label="City">
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="maxTuition" defaultValue={sp.maxTuition ?? ""} className={sel} aria-label="Max tuition">
          <option value="">Any tuition</option>
          <option value="0">Free for me</option>
          {[5000, 8000, 10000, 12000, 15000].map((v) => (
            <option key={v} value={v}>Up to €{v.toLocaleString("en")}/yr</option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className={sel} aria-label="Sort by">
          <option value="match">Sort: best match</option>
          <option value="deadline">Sort: earliest deadline</option>
          <option value="tuition">Sort: lowest tuition</option>
        </select>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:col-span-2 lg:col-span-4">
          <Toggle name="open" value="1" checked={sp.open === "1"} label="Deadline still open" />
          {myBand != null && <Toggle name="english" value="mine" checked={sp.english === "mine"} label="I meet the English requirement" />}
          <Toggle name="partner" value="1" checked={sp.partner === "1"} label="Partner schools only" />
          <div className="ml-auto flex gap-2">
            {activeFilters > 0 && (
              <Link href={{ query: { scope } }} className="rounded-full px-4 py-2 text-ink-soft hover:text-ink">
                Clear
              </Link>
            )}
            <button type="submit" className="rounded-full bg-ink px-5 py-2 font-medium text-white hover:bg-ink-soft">
              Apply filters
            </button>
          </div>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted">
        {results.length} programme{results.length === 1 ? "" : "s"}
      </p>
      {results.length > 0 ? (
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((m) => (
            <ProgrammeCard key={m.programme.id} match={m} saved={savedIds.has(m.programme.id)} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-[var(--radius-card)] border border-dashed border-line bg-surface px-6 py-12 text-center">
          <p className="font-semibold">No programmes match these filters</p>
          <p className="mt-2 text-sm text-ink-soft">Try removing a filter or showing all levels.</p>
        </div>
      )}
    </div>
  );
}

function Toggle({ name, value, checked, label }: { name: string; value: string; checked: boolean; label: string }) {
  return (
    <label className="flex items-center gap-2 text-ink-soft">
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="h-4 w-4 accent-[#102448]" />
      {label}
    </label>
  );
}
