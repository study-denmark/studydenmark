import Link from "next/link";
import type { ReactNode } from "react";
import { guideNav } from "@/config/site";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export function GuideLayout({
  current,
  title,
  intro,
  updated = "October 2026",
  children,
}: {
  current: string;
  title: string;
  intro: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
        <aside className="order-2 lg:order-1">
          <nav className="sticky top-36">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Guide</p>
            <ul className="space-y-1">
              {guideNav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`block rounded-lg px-3 py-2 text-[15px] ${
                      current === l.href ? "bg-surface font-medium text-ink shadow-[inset_2px_0_0_#C8102E]" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <article className="order-1 max-w-3xl lg:order-2">
          <Eyebrow>Studying in Denmark</Eyebrow>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{intro}</p>
          <p className="mt-4 text-xs text-muted">
            Last reviewed {updated}. Rules change – always confirm with the official source linked on this page.
          </p>
          <div className="prose-guide mt-8">{children}</div>
          <div className="mt-14 rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Find out what applies to you</h2>
            <p className="mt-2 text-ink-soft">
              Answer five questions and see which programme types you can apply for and when your deadline is.
            </p>
            <ButtonLink href="/denmark/eligibility" variant="accent" className="mt-5">
              Check your eligibility
            </ButtonLink>
          </div>
        </article>
      </div>
    </Container>
  );
}
