"use client";

import Link from "next/link";
import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/actions/waitlist";

export function WaitlistForm() {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, { status: "idle" });

  if (state.status === "ok") {
    return (
      <p role="status" className="rounded-xl border border-sea/20 bg-sea-soft px-4 py-3.5 text-[15px] text-sea">
        <strong>You’re on the list.</strong> We’ll email you as soon as we open.
      </p>
    );
  }

  return (
    <form action={action} className="max-w-md">
      <label htmlFor="waitlist-email" className="text-sm font-medium text-ink">
        Get an email when we launch
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="min-h-12 flex-1 rounded-full border border-line bg-surface px-5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-sea"
        />
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
