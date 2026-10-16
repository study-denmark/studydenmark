"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, FormError } from "@/components/auth-shell";
import { Button, Field, inputClass } from "@/components/ui";
import { Turnstile, type TurnstileHandle } from "@/components/turnstile";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileHandle>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!captcha) return setError("Please complete the security check.");
    setLoading(true);
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/password`,
      captchaToken: captcha,
    });
    captchaRef.current?.reset();
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <AuthShell title="Reset your password">
      {sent ? (
        <p className="text-ink-soft">If an account exists for that email, we’ve sent a link to reset your password.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Email">
            <input name="email" type="email" required autoComplete="email" className={inputClass} />
          </Field>
          <Turnstile ref={captchaRef} onToken={setCaptcha} />
          <FormError message={error} />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
