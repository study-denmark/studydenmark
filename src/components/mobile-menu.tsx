"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { guideNav, publicNav } from "@/config/site";

export function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [...publicNav, ...guideNav.filter((g) => !publicNav.some((p) => p.href === g.href))];

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          {open ? (
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-line bg-paper px-4 pb-10 pt-4">
          <nav className="flex flex-col">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line py-4 text-lg text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            {signedIn ? (
              <>
                <Link href="/dashboard" className="rounded-full bg-ink py-3 text-center font-medium text-white">
                  My dashboard
                </Link>
                <Link href="/account" className="rounded-full border border-line bg-surface py-3 text-center">
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="rounded-full bg-ink py-3 text-center font-medium text-white">
                  Get started
                </Link>
                <Link href="/login" className="rounded-full border border-line bg-surface py-3 text-center">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
