"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, FormError } from "@/components/auth-shell";
import { Button, Field, inputClass } from "@/components/ui";

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    if (password.length < 8) return setError("Your password must be at least 8 characters.");
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else setDone(true);
  }

  return (
    <AuthShell title="Choose a new password">
      {done ? (
        <p className="text-ink-soft">
          Password updated. <a href="/dashboard" className="text-sea underline underline-offset-4">Go to your dashboard</a>
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="New password" hint="At least 8 characters">
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
          </Field>
          <FormError message={error} />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving…" : "Save password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
