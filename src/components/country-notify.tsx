"use client";

import { useState } from "react";
import { WaitlistForm } from "@/components/waitlist-form";

/** "Notify me" button that reveals the waitlist form. `compact` is for one-line rows (form opens full width below). */
export function CountryNotify({ country, source, compact = false }: { country: string; source: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface font-medium text-ink transition-colors hover:border-ink/40 ${
          compact ? "ml-auto px-4 text-sm" : "px-5 text-[15px]"
        }`}
      >
        Notify me
      </button>
    );
  }

  return (
    <div className={compact ? "basis-full pb-1.5" : undefined}>
      <WaitlistForm
        source={source}
        label={`Get an email when ${country} opens`}
        successMessage={`We’ll email you when ${country} opens.`}
        stacked={!compact}
        autoFocus
      />
    </div>
  );
}
