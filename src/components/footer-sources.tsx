"use client";

import { usePathname } from "next/navigation";
import { countries, type SourceLink } from "@/config/countries";

function SourceList({ links }: { links: SourceLink[] }) {
  return (
    <ul className="space-y-2 text-sm text-muted">
      {links.map((l) => (
        <li key={l.href}>
          <a className="hover:text-ink" href={l.href} target="_blank" rel="noopener">
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** On a country's own pages: that country's sources. Elsewhere: all countries, grouped. */
export function FooterSources() {
  const pathname = usePathname();
  const current = countries.find((c) => c.href && (pathname === c.href || pathname.startsWith(c.href + "/")));

  return (
    <div>
      <p className="mb-3 text-sm font-semibold">Official sources</p>
      {current ? (
        <SourceList links={current.pageSources ?? current.sources} />
      ) : (
        <div className="space-y-4">
          {countries.map((c) => (
            <div key={c.id}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">{c.name}</p>
              <SourceList links={c.sources} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
