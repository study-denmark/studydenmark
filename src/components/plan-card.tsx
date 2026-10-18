import type { ReactNode } from "react";
import { site } from "@/config/site";
import { planFeatures, type Plan } from "@/lib/plans";

const blurb: Record<Plan, string> = {
  basic: "See exactly what you can study in Denmark.",
  premium: "We help you apply – documents checked, applications handled.",
};

export function PlanCard({ plan, highlight, children }: { plan: Plan; highlight?: boolean; children?: ReactNode }) {
  const p = site.plans[plan];
  return (
    <div
      className={`relative flex flex-col rounded-[var(--radius-card)] bg-surface p-7 sm:p-8 ${
        highlight ? "border-2 border-ink" : "border border-line"
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
          Most help
        </span>
      )}
      <h2 className="text-xl font-semibold">{p.name}</h2>
      <p className="mt-1 text-[15px] text-ink-soft">{blurb[plan]}</p>
      <p className="mt-5 font-[family-name:var(--font-display)] text-5xl font-semibold">{p.amountLabel}</p>
      <p className="mt-1 text-sm text-muted">
        per {p.interval} · {p.approxEur} · renews yearly
      </p>
      <ul className="mt-7 space-y-3 text-[15px]">
        {planFeatures[plan].map((f) => (
          <li key={f} className="flex gap-3">
            <Tick /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">{children}</div>
    </div>
  );
}

export function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="mt-0.5 shrink-0" aria-hidden>
      <path d="M4 9.5l3 3 7-7" fill="none" stroke="#2F5D62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
