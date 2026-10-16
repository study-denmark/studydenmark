"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, FormError } from "@/components/auth-shell";
import { Button, Field, inputClass } from "@/components/ui";

export function LoginForm() {
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const [error, setError] = useState<string | null>(
    params.get("error") === "link" ? "That link has expired or was already used. Please log in or request a new one." : null,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });
    if (error) {
      setLoading(false);
      setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
      return;
    }
    window.location.href = next;
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle={<>New here? <Link href="/signup" className="text-sea underline underline-offset-4">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </Field>
        <Field label="Password">
          <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
        </Field>
        <FormError message={error} />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in…" : "Log in"}
        </Button>
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-muted underline underline-offset-4 hover:text-ink">
            Forgot your password?
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
