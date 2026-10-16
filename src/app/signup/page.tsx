"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/config/site";
import { AuthShell, FormError } from "@/components/auth-shell";
import { Button, Field, inputClass } from "@/components/ui";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const fullName = String(form.get("full_name")).trim();

    if (form.get("terms") !== "on") {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/subscribe`,
        data: {
          full_name: fullName,
          accepted_terms: "true",
          accepted_marketing: form.get("marketing") === "on" ? "true" : "false",
          consent_version: site.consentVersion,
        },
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    // If email confirmation is disabled, a session is returned immediately.
    if (data.session) {
      window.location.href = "/subscribe";
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <AuthShell title="Check your inbox">
        <p className="text-ink-soft">
          We sent a confirmation link to <strong className="text-ink">{sentTo}</strong>. Click it to activate
          your account – then you can choose your membership.
        </p>
        <p className="mt-4 text-sm text-muted">Can’t find it? Check your spam folder.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle={<>Already have one? <Link href="/login" className="text-sea underline underline-offset-4">Log in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Full name">
          <input name="full_name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
        </Field>

        <div className="space-y-3 rounded-xl bg-paper p-4 text-sm">
          <label className="flex gap-3">
            <input name="terms" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#14213D]" />
            <span>
              I accept the <Link href="/terms" target="_blank" className="underline">terms of service</Link> and
              have read the <Link href="/privacy" target="_blank" className="underline">privacy policy</Link>.
            </span>
          </label>
          <label className="flex gap-3 text-ink-soft">
            <input name="marketing" type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#14213D]" />
            <span>Email me deadline reminders and tips (optional).</span>
          </label>
        </div>

        <FormError message={error} />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-center text-xs text-muted">
          Next step: choose your membership ({site.price.amountLabel}/{site.price.interval}).
        </p>
      </form>
    </AuthShell>
  );
}
