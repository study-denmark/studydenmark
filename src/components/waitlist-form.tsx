"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/actions/waitlist";

type Props = {
  /** Stored in waitlist.source; the server only accepts known values */
  source?: string;
  label?: string;
  successMessage?: string;
  /** Stack the field and button – for narrow containers like cards */
  stacked?: boolean;
  autoFocus?: boolean;
};

export function WaitlistForm({
  source = "coming-soon",
  label = "Get an email when we launch",
  successMessage = "We’ll email you as soon as we open.",
  stacked = false,
  autoFocus = false,
}: Props) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, { status: "idle" });
  const inputId = useId();

  if (state.status === "ok") {
    return (
      <p role="status" className="rounded-xl border border-sea/20 bg-sea-soft px-4 py-3.5 text-[15px] text-sea">
        <strong>You’re on the list.</strong> {successMessage}
      </p>
    );
  }

  return (
    <form action={action} className="max-w-md">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className={`mt-2 flex flex-col gap-2 ${stacked ? "" : "sm:flex-row"}`}>
        <input
          id={inputId}
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus={autoFocus}
          placeholder="you@example.com"
          className="min-h-12 flex-1 rounded-full border border-line bg-surface px-5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-sea"
        />
        <input type="hidden" name="source" value={source} />
        {/* Honeypot for bots – hidden from people and screen readers */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 rounded-full bg-accent px-6 text-[15px] font-semibold text-white hover:bg-[#a50d26] disabled:opacity-60"
        >
          {pending ? "Signing up…" : "Notify me"}
        </button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-accent">{state.message}</p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted">
        We’ll only use your email to tell you when we launch – no spam. See our{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">privacy policy</Link>.
      </p>
    </form>
  );
}
