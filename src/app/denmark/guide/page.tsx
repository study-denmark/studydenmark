import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCountry } from "@/config/countries";
import { CountryPage } from "@/components/country-layout";

export const metadata: Metadata = { title: "Guide to studying in Denmark" };

const denmark = getCountry("denmark");

export default function GuideIndexPage() {
  const pages = (denmark.guide ?? []).map((g) => ({ href: g.href, ...(g.card ?? g.summary)! }));

  return (
    <CountryPage eyebrow="Free guide" title="Start with the basics">
      <ul className="grid gap-3 md:grid-cols-2">
        {pages.map((p, i) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-3 pr-5 transition-colors hover:border-ink/30"
            >
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-sea-soft">
                <Image src={p.image} alt="" fill sizes="96px" className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="text-lg font-semibold leading-snug">{p.title}</h2>
                <p className="mt-0.5 text-sm text-ink-soft">{p.body}</p>
              </div>
              <span aria-hidden className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </CountryPage>
  );
}
