import type { ReactNode } from "react";

// Simplified flags at 3:2-ish proportions; decorative only, the country name is always shown as text
const flags: Record<string, ReactNode> = {
  denmark: (
    <svg viewBox="0 0 37 28" aria-hidden>
      <rect width="37" height="28" fill="#C8102E" />
      <rect x="12" width="4" height="28" fill="#fff" />
      <rect y="12" width="37" height="4" fill="#fff" />
    </svg>
  ),
  sweden: (
    <svg viewBox="0 0 16 10" aria-hidden>
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" width="2" height="10" fill="#FECC00" />
      <rect y="4" width="16" height="2" fill="#FECC00" />
    </svg>
  ),
  norway: (
    <svg viewBox="0 0 22 16" aria-hidden>
      <rect width="22" height="16" fill="#BA0C2F" />
      <rect x="6" width="4" height="16" fill="#fff" />
      <rect y="6" width="22" height="4" fill="#fff" />
      <rect x="7" width="2" height="16" fill="#00205B" />
      <rect y="7" width="22" height="2" fill="#00205B" />
    </svg>
  ),
  finland: (
    <svg viewBox="0 0 18 11" aria-hidden>
      <rect width="18" height="11" fill="#fff" />
      <rect x="5" width="3" height="11" fill="#002F6C" />
      <rect y="4" width="18" height="3" fill="#002F6C" />
    </svg>
  ),
  netherlands: (
    <svg viewBox="0 0 9 6" aria-hidden>
      <rect width="9" height="2" fill="#AE1C28" />
      <rect y="2" width="9" height="2" fill="#fff" />
      <rect y="4" width="9" height="2" fill="#21468B" />
    </svg>
  ),
};

export function Flag({ id, large = false }: { id: string; large?: boolean }) {
  return (
    <span
      className={`block shrink-0 overflow-hidden rounded-[4px] ring-1 ring-ink/10 [&>svg]:h-full [&>svg]:w-full ${large ? "h-7 w-10" : "h-5 w-7"}`}
    >
      {flags[id]}
    </span>
  );
}
