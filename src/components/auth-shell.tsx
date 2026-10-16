import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-ink-soft">{subtitle}</p>}
        <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">{children}</div>
      </div>
    </Container>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-accent/25 bg-accent-soft px-3 py-2 text-sm text-ink">
      {message}
    </p>
  );
}
