import type { ReactNode } from "react";

export type FlagCode = "DK" | "SE" | "NO" | "FI" | "NL";

// All flags share one 3:2 viewBox so they line up at every size. Decorative only:
// the country name is always shown as text next to the flag.
const shapes: Record<FlagCode, ReactNode> = {
  DK: (
    <>
      <rect width="30" height="20" fill="#C8102E" />
      <rect x="9" width="3.5" height="20" fill="#fff" />
      <rect y="8.25" width="30" height="3.5" fill="#fff" />
    </>
  ),
  SE: (
    <>
      <rect width="30" height="20" fill="#006AA7" />
      <rect x="9" width="3.5" height="20" fill="#FECC00" />
      <rect y="8.25" width="30" height="3.5" fill="#FECC00" />
    </>
  ),
  NO: (
    <>
      <rect width="30" height="20" fill="#BA0C2F" />
      <rect x="8" width="6" height="20" fill="#fff" />
      <rect y="7" width="30" height="6" fill="#fff" />
      <rect x="9.5" width="3" height="20" fill="#00205B" />
      <rect y="8.5" width="30" height="3" fill="#00205B" />
    </>
  ),
  FI: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect x="8.5" width="4" height="20" fill="#003580" />
      <rect y="8" width="30" height="4" fill="#003580" />
    </>
  ),
  NL: (
    <>
      <rect width="30" height="6.67" fill="#AE1C28" />
      <rect y="6.67" width="30" height="6.66" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#21468B" />
    </>
  ),
};

const sizes = {
  sm: "h-4 w-6", // 24×16
  md: "h-6 w-9", // 36×24
  lg: "h-8 w-12", // 48×32
} as const;

export function Flag({ code, size = "sm" }: { code: FlagCode; size?: keyof typeof sizes }) {
  return (
    // The ring is drawn on an overlay: an inset shadow on the wrapper itself would sit underneath the SVG
    <span
      className={`relative block shrink-0 overflow-hidden rounded-[4px] after:pointer-events-none after:absolute after:inset-0 after:rounded-[4px] after:ring-1 after:ring-inset after:ring-ink/15 after:content-[''] ${sizes[size]}`}
    >
      <svg viewBox="0 0 30 20" aria-hidden className="block h-full w-full">
        {shapes[code]}
      </svg>
    </span>
  );
}
