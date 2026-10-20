"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { CountryTab } from "@/config/countries";
import { Container } from "@/components/ui";
import { Flag } from "@/components/flags";

export function CountrySubnav({ countryId, name, href, tabs }: { countryId: string; name: string; href: string; tabs: CountryTab[] }) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  // On narrow screens the bar scrolls sideways – keep the current tab in view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <Container className="flex h-14 items-center gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href={href} className="flex shrink-0 items-center gap-2 text-[15px] font-semibold text-ink">
          <Flag id={countryId} />
          {name}
        </Link>
        <span aria-hidden className="h-5 w-px shrink-0 bg-line" />
        <nav aria-label={`${name} pages`} className="flex shrink-0 items-center gap-1">
          {tabs.map((tab) => {
            const active =
              tab.match === "prefix"
                ? pathname === tab.href || pathname.startsWith(tab.href + "/")
                : pathname === tab.href;
            return (
              <Link
                key={tab.href}
                ref={active ? activeRef : undefined}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-11 items-center whitespace-nowrap rounded-full px-4 text-sm transition-colors ${
                  active ? "bg-ink font-medium text-white" : "text-ink-soft hover:bg-surface hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </div>
  );
}
