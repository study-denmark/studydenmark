import Link from "next/link";
import { levelLabels } from "@/lib/labels";
import type { Match } from "@/lib/matching";
import { tierLabels } from "@/lib/matching";
import { toggleSaved } from "@/app/actions/programmes";
import { PartnerBadge } from "@/components/ui";

const tierStyle = {
  strong: "bg-sea-soft text-sea",
  good: "bg-paper text-ink",
  possible: "bg-paper text-muted",
} as const;

export function ProgrammeCard({ match, saved, showChecks = true }: { match: Match; saved: boolean; showChecks?: boolean }) {
  const p = match.programme;
  const partner = !!p.institutions?.is_partner;

  return (
    <article
      className={`relative flex h-full flex-col rounded-[var(--radius-card)] border bg-surface p-5 transition-colors hover:border-ink/30 sm:p-6 ${
        partner ? "border-accent/25" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tierStyle[match.tier]}`}>
            {tierLabels[match.tier]}
          </span>
          {partner && <PartnerBadge />}
        </div>
        <SaveButton programmeId={p.id} saved={saved} />
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug">
        <Link href={`/dashboard/programmes/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {p.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-ink-soft">{p.institutions?.name}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <Fact k="Level" v={levelLabels[p.level]} />
        <Fact k="City" v={p.city} />
        <Fact k="Tuition" v={match.tuition === 0 ? "Free" : match.tuition != null ? `€${match.tuition.toLocaleString("en")}` : "—"} />
      </dl>

      {showChecks && (
        <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-[13px]">
          {match.checks.slice(0, 4).map((c) => (
            <li key={c.label} className="flex gap-2">
              <CheckIcon ok={c.ok} />
              <span className={c.ok === false ? "text-ink" : "text-ink-soft"}>{c.label}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-paper px-2.5 py-2">
      <dt className="text-[11px] text-muted">{k}</dt>
      <dd className="truncate font-medium">{v}</dd>
    </div>
  );
}

export function CheckIcon({ ok }: { ok: boolean | null }) {
  if (ok === true)
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0" aria-label="OK">
        <circle cx="8" cy="8" r="8" fill="#E6EFEE" />
        <path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="#2F5D62" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (ok === false)
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0" aria-label="Attention">
        <circle cx="8" cy="8" r="8" fill="#FBE9EC" />
        <path d="M8 4.5v4.2M8 11.2v.3" stroke="#C8102E" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0" aria-label="Unknown">
      <circle cx="8" cy="8" r="7.25" fill="none" stroke="#C9C4B8" strokeWidth="1.5" />
      <path d="M5.5 8h5" stroke="#9AA0AC" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function SaveButton({ programmeId, saved, withLabel = false }: { programmeId: string; saved: boolean; withLabel?: boolean }) {
  return (
    <form action={toggleSaved} className="relative z-10">
      <input type="hidden" name="programme_id" value={programmeId} />
      <input type="hidden" name="saved" value={saved ? "1" : "0"} />
      <button
        type="submit"
        aria-label={saved ? "Remove from saved" : "Save programme"}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
          saved ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft hover:border-ink/40"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M3 1.5h8v11L7 9.5l-4 3z" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        {withLabel ? (saved ? "Saved" : "Save") : null}
      </button>
    </form>
  );
}
