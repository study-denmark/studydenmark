import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { countryName, EDUCATION_LEVELS } from "@/lib/constants";
import { docLabel, APPLICATION_COLUMNS } from "@/lib/documents";
import { adminStageLabels, eur, fmtDate, Pill, subTone } from "@/lib/admin-ui";
import { subscriptionStatusLabels } from "@/lib/labels";
import { deleteMember, endManualMembership, grantMembership, setMemberRole } from "@/app/actions/admin-ops";
import { planLabel, type Plan } from "@/lib/plans";
import { Button, Callout, Card, inputClass } from "@/components/ui";
import { DocReview } from "@/app/admin/documents/review";

export default async function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; granted?: string }>;
}) {
  const { id } = await params;
  const { error, granted } = await searchParams;
  const supabase = await createClient();

  const { data: p } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  const [{ data: subs }, { data: payments }, { data: docs }, { data: apps }, { data: consents }, { data: saved }] = await Promise.all([
    supabase.from("subscriptions").select("status, plan, stripe_subscription_id, current_period_end, cancel_at_period_end, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("payments").select("amount_cents, currency, status, paid_at").eq("user_id", id).order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("id, document_type, file_name, status, reviewer_comment, created_at")
      .eq("user_id", id)
      .order("document_type"),
    supabase
      .from("applications")
      .select(`${APPLICATION_COLUMNS}, programmes(title), institutions(name)`)
      .eq("user_id", id)
      .returns<{ id: string; stage: string; created_at: string; programmes: { title: string } | null; institutions: { name: string } | null }[]>(),
    supabase.from("consents").select("consent_type, version, granted_at, revoked_at, institutions(name)").eq("user_id", id).order("granted_at"),
    supabase.from("saved_programmes").select("programmes(title)").eq("user_id", id),
  ]);

  const rows: [string, string][] = [
    ["Email", p.email],
    ["Nationality", `${countryName(p.nationality) ?? "—"}${p.is_eu_eea ? " (EU/EEA)" : p.nationality ? " (non-EU)" : ""}`],
    ["Education", EDUCATION_LEVELS.find((e) => e.value === p.education_level)?.label ?? "—"],
    ["Interest", p.field_of_interest ?? "—"],
    ["English", p.english_test_type ? `${p.english_test_type} ${p.english_test_score ?? ""}` : "—"],
    ["Start", p.desired_start ?? "—"],
    ["Budget", p.budget_eur_per_year != null ? `${eur(p.budget_eur_per_year)}/yr` : "—"],
    ["Joined", fmtDate(p.created_at)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/members" className="text-sm text-muted hover:text-ink">← Members</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold">{p.full_name ?? p.email}</h1>
        {p.role === "admin" && <Pill tone="ink">Admin</Pill>}
      </div>
      {error === "self" && <Callout tone="warn">You can’t remove your own admin rights or delete yourself here.</Callout>}
      {error === "confirm" && <Callout tone="warn">Type DELETE to confirm.</Callout>}
      {error === "grant" && <Callout tone="warn">Could not grant membership. Check that SUPABASE_SECRET_KEY is set in Vercel.</Callout>}
      {granted && <Callout>{planLabel(granted as Plan)} granted for 12 months.</Callout>}
      {error === "delete" && <Callout tone="warn">Deleting failed. Check that SUPABASE_SECRET_KEY is set in Vercel.</Callout>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Profile</h2>
          <dl className="mt-4 space-y-2 text-[15px]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>
            ))}
          </dl>
          {saved && saved.length > 0 && (
            <p className="mt-4 border-t border-line pt-4 text-sm text-ink-soft">
              <span className="text-muted">Saved: </span>
              {saved.map((x) => (x.programmes as unknown as { title: string } | null)?.title).filter(Boolean).join(", ")}
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Membership & payments</h2>
          {subs?.length ? (
            subs.map((s, i) => (
              <div key={i} className="mt-4 flex flex-wrap items-center gap-2 text-[15px]">
                <Pill tone={s.plan === "premium" ? "ink" : "gray"}>{planLabel(s.plan as Plan)}</Pill>
                <Pill tone={subTone(s.status)}>{subscriptionStatusLabels[s.status] ?? s.status}</Pill>
                <span className="text-ink-soft">
                  {s.cancel_at_period_end ? "ends" : "renews"} {fmtDate(s.current_period_end)}
                  {s.stripe_subscription_id.startsWith("manual_") && " · given manually"}
                </span>
                {s.stripe_subscription_id.startsWith("manual_") && ["active", "trialing"].includes(s.status) && (
                  <form action={endManualMembership}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="subscription_id" value={s.stripe_subscription_id} />
                    <button type="submit" className="text-sm text-accent underline">End now</button>
                  </form>
                )}
              </div>
            ))
          ) : (
            <p className="mt-4 text-ink-soft">No membership.</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
            {(["basic", "premium"] as const).map((plan) => (
              <form key={plan} action={grantMembership}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="plan" value={plan} />
                <Button variant="ghost" type="submit">Give {planLabel(plan)} for 12 months</Button>
              </form>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">For members who paid another way, or got it for free. No Stripe payment is made.</p>
          {payments && payments.length > 0 && (
            <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
              {payments.map((x, i) => (
                <li key={i} className="flex justify-between">
                  <span>{fmtDate(x.paid_at)}</span>
                  <span>{(x.amount_cents / 100).toLocaleString("en")} {x.currency.toUpperCase()} · {x.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Applications</h2>
        {apps?.length ? (
          <ul className="mt-3 divide-y divide-line">
            {apps.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <Link href={`/admin/applications/${a.id}`} className="font-medium hover:text-sea">
                  {a.programmes?.title} <span className="font-normal text-muted">· {a.institutions?.name}</span>
                </Link>
                <Pill tone={adminStageLabels[a.stage]?.tone}>{adminStageLabels[a.stage]?.label ?? a.stage}</Pill>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-ink-soft">None.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Documents</h2>
        {docs?.length ? (
          <ul className="mt-3 divide-y divide-line">
            {docs.map((d) => (
              <li key={d.id} className="py-3">
                <DocReview doc={{ ...d, docLabel: docLabel(d.document_type) }} back={`/admin/members/${id}`} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-ink-soft">No documents uploaded.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Consents</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {(consents ?? []).map((c, i) => (
            <li key={i} className="flex flex-wrap justify-between gap-2">
              <span>
                {c.consent_type.replace(/_/g, " ")}
                {(c.institutions as unknown as { name: string } | null)?.name && ` – ${(c.institutions as unknown as { name: string }).name}`}
                <span className="text-muted"> ({c.version})</span>
              </span>
              <span className="text-muted">{fmtDate(c.granted_at)}{c.revoked_at && ` · revoked ${fmtDate(c.revoked_at)}`}</span>
            </li>
          ))}
          {!consents?.length && <li className="text-ink-soft">None recorded.</li>}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Actions</h2>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <form action={setMemberRole}>
            <input type="hidden" name="id" value={p.id} />
            <input type="hidden" name="role" value={p.role === "admin" ? "student" : "admin"} />
            <Button variant="ghost" type="submit">{p.role === "admin" ? "Remove admin rights" : "Make admin"}</Button>
          </form>
          <form action={deleteMember} className="flex flex-col gap-2 sm:items-end">
            <input type="hidden" name="id" value={p.id} />
            <div className="flex gap-2">
              <input name="confirm" placeholder="Type DELETE" autoComplete="off" className={`${inputClass} py-2 sm:w-40`} />
              <Button variant="accent" type="submit">Delete member</Button>
            </div>
            <p className="text-xs text-muted">Deletes account, files and applications. Cancels any membership.</p>
          </form>
        </div>
      </Card>
    </div>
  );
}
