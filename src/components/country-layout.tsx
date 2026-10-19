import type { ReactNode } from "react";
import { getCountry } from "@/config/countries";
import { CountrySubnav } from "@/components/country-subnav";
import { Container, Eyebrow } from "@/components/ui";

/**
 * Shared shell for every page of a country: the sticky country bar plus the page.
 * A new country only needs src/app/<country>/layout.tsx rendering <CountryLayout country="<id>">.
 */
export function CountryLayout({ country, children }: { country: string; children: ReactNode }) {
  const c = getCountry(country);
  return (
    <>
      <CountrySubnav countryId={c.id} name={c.name} href={c.href ?? "/"} tabs={c.tabs ?? []} />
      {children}
    </>
  );
}

/** Same container, spacing and heading style on every country sub-page (programmes, eligibility, guide index). */
export function CountryPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
        {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{intro}</div>}
      </header>
      <div className="mt-10">{children}</div>
    </Container>
  );
}
