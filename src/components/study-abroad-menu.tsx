"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { countries } from "@/config/countries";
import { Flag } from "@/components/flags";

/** Country list used by both the desktop dropdown and the mobile menu */
export function CountryList() {
  return (
    <ul className="space-y-1">
      {countries.map((c) => {
        const body = (
          <>
            <Flag id={c.id} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-ink">{c.name}</span>
              <span className="block text-xs text-muted">{c.portal}</span>
            </span>
            {c.status === "available" ? (
              <span className="shrink-0 rounded-full bg-sea-soft px-2.5 py-0.5 text-xs font-semibold text-sea">Available now</span>
            ) : (
              <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-muted">Coming soon</span>
            )}
          </>
        );
        return (
          <li key={c.id}>
            {c.status === "available" && c.href ? (
              <Link href={c.href} className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 hover:bg-paper">
                {body}
              </Link>
            ) : (
              <div className="flex min-h-11 items-center gap-3 px-3 py-2 opacity-80">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function StudyAbroadMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex items-center gap-1.5 hover:text-ink"
      >
        Study abroad
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1.5 3.5L5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute left-1/2 top-full z-50 mt-3 w-[340px] -translate-x-1/2 rounded-[var(--radius-card)] border border-line bg-surface p-2 shadow-[0_30px_60px_-30px_rgba(16,36,72,0.35)]"
        >
          <CountryList />
        </div>
      )}
    </div>
  );
}
