import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const btnVariants = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  accent: "bg-accent text-white hover:bg-[#a50d26]",
  ghost: "border border-line bg-surface text-ink hover:border-ink/40",
  link: "px-0 py-0 text-sea underline underline-offset-4 hover:text-ink",
} as const;
type Variant = keyof typeof btnVariants;

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${btnBase} ${btnVariants[variant]} ${className}`} {...props} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${btnBase} ${btnVariants[variant]} ${className}`} {...props} />;
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-line bg-surface p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-sea">{children}</p>
  );
}

/** Required wherever a partner school is shown (markedsføringsloven: no hidden advertising). */
export function PartnerBadge() {
  return (
    <span
      title="We have a referral agreement with this institution. It does not affect the requirements or information shown."
      className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
        <path d="M5 0l1.4 3.3L10 3.6 7.3 6l.8 3.5L5 7.7 1.9 9.5 2.7 6 0 3.6l3.6-.3z" fill="currentColor" />
      </svg>
      Partner
    </span>
  );
}

export function Callout({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn";
  children: ReactNode;
}) {
  const tones = {
    info: "border-sea/25 bg-sea-soft text-ink",
    warn: "border-accent/25 bg-accent-soft text-ink",
  };
  return <div className={`rounded-xl border px-4 py-3 text-[15px] leading-relaxed ${tones[tone]}`}>{children}</div>;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:border-sea focus:outline-none";

export function Check({ light = false }: { light?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={light ? "rgba(255,255,255,0.15)" : "#E8EEF4"} />
      <path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke={light ? "#fff" : "#3D6185"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
