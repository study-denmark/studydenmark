"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { publicNav } from "@/config/site";
import { CountryList } from "@/components/study-abroad-menu";

export function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [countriesOpen, setCountriesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setCountriesOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
            <div className="border-b border-line">
              <button
                type="button"
                onClick={() => setCountriesOpen((o) => !o)}
                aria-expanded={countriesOpen}
                aria-controls="mobile-countries"
                className="flex w-full items-center justify-between py-4 text-left text-lg text-ink"
              >
                Study abroad
                <svg width="14" height="14" viewBox="0 0 10 10" aria-hidden className={`transition-transform ${countriesOpen ? "rotate-180" : ""}`}>
                  <path d="M1.5 3.5L5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {countriesOpen && (
                <div id="mobile-countries" className="-mx-3 pb-3">
                  <CountryList />
                </div>
              )}
            </div>
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                // Hash links (/#how-it-works) don't change the pathname, so close explicitly
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 text-lg text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            {signedIn ? (
              <Link href="/dashboard" className="rounded-full bg-ink py-3 text-center font-medium text-white">
                My account
              </Link>
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
