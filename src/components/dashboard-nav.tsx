"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items: { href: string; label: string; premium?: boolean }[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/programmes", label: "All programmes" },
  { href: "/dashboard/saved", label: "Saved" },
  { href: "/dashboard/documents", label: "Documents", premium: true },
  { href: "/dashboard/applications", label: "Applications", premium: true },
  { href: "/onboarding", label: "My profile" },
  { href: "/account", label: "Account settings" },
];

export function DashboardNav({ isAdmin, isPremium }: { isAdmin: boolean; isPremium: boolean }) {
  const path = usePathname();
  const all = isAdmin ? [...items, { href: "/admin", label: "Admin" }] : items;
  return (
    <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-line">
        {all.map((i) => {
          const active = i.href === "/dashboard" ? path === "/dashboard" : path.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`-mb-px block border-b-2 px-3 py-3 text-[15px] ${
                  active ? "border-accent font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {i.label}
                {i.premium && !isPremium && (
                  <span className="ml-1.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[11px] font-semibold text-accent">Premium</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
