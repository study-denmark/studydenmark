import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { eur, Table } from "@/lib/admin-ui";

export default async function AdminHome() {
  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  const results = await Promise.all([
    supabase.from("institutions").select("*", head),
    supabase.from("institutions").select("*", head).eq("is_partner", true),
    supabase.from("programmes").select("*", head),
    supabase.from("programmes").select("*", head).eq("is_published", true),
    supabase.from("profiles").select("*", head).eq("role", "student"),
    supabase.from("profiles").select("*", head).eq("role", "student").not("onboarding_completed_at", "is", null),
    supabase.from("subscriptions").select("*", head).in("status", ["active", "trialing"]),
  ]);
  const [institutions, partners, programmes, published, students, onboarded, active] = results.map((r) => r.count ?? 0);

  const [{ data: apps }, pending] = await Promise.all([
    supabase
      .from("applications")
      .select("stage, institutions(name, is_partner), application_admin(commission_status, commission_amount_eur)")
      .returns<{ stage: string; institutions: { name: string; is_partner: boolean } | null; application_admin: { commission_status: string; commission_amount_eur: number | null } | null }[]>(),
    supabase.from("documents").select("*", head).eq("status", "uploaded"),
  ]);
  type Agg = { requests: number; sent: number; admitted: number; started: number; expected: number; invoiced: number; paid: number };
  const bySchool = new Map<string, Agg>();
  const totals: Agg = { requests: 0, sent: 0, admitted: 0, started: 0, expected: 0, invoiced: 0, paid: 0 };
  for (const a of apps ?? []) {
    const key = a.institutions?.name ?? "Unknown";
    const g = bySchool.get(key) ?? { requests: 0, sent: 0, admitted: 0, started: 0, expected: 0, invoiced: 0, paid: 0 };
    const reached = ["sent_to_school", "admitted", "started"].indexOf(a.stage);
    for (const t of [g, totals]) {
      t.requests++;
      if (reached >= 0) t.sent++;
      if (reached >= 1) t.admitted++;
      if (reached >= 2) t.started++;
      const amt = a.application_admin?.commission_amount_eur ?? 0;
      const st = a.application_admin?.commission_status;
      if (st === "expected") t.expected += amt;
      if (st === "invoiced") t.invoiced += amt;
      if (st === "paid") t.paid += amt;
    }
    bySchool.set(key, g);
  }
  const newRequests = (apps ?? []).filter((a) => a.stage === "interested").length;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat k="Students" v={students} sub={`${onboarded} completed profile`} />
        <Stat k="Active memberships" v={active} />
        <Stat k="Programmes" v={programmes} sub={`${published} published`} href="/admin/programmes" />
        <Stat k="Institutions" v={institutions} sub={`${partners} partners`} href="/admin/institutions" />
      </div>
      {(newRequests > 0 || (pending.count ?? 0) > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat k="New application requests" v={newRequests} sub="Waiting for you" href="/admin/applications?stage=interested" />
          <Stat k="Documents to review" v={pending.count ?? 0} sub="Approve or reject" href="/admin/documents" />
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold">Referrals & commission</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Stat k="Expected" v={totals.expected} money />
          <Stat k="Invoiced" v={totals.invoiced} money />
          <Stat k="Paid" v={totals.paid} money />
        </div>
        <div className="mt-4">
          <Table head={["School", "Requests", "Sent", "Admitted", "Started", "Expected", "Invoiced", "Paid"]} minWidth={760}>
            {[...bySchool.entries()].sort((a, b) => b[1].requests - a[1].requests).map(([name, g]) => (
              <tr key={name} className="border-t border-line text-ink-soft">
                <td className="px-4 py-3 font-medium text-ink">{name}</td>
                <td className="px-4 py-3">{g.requests}</td>
                <td className="px-4 py-3">{g.sent}</td>
                <td className="px-4 py-3">{g.admitted}</td>
                <td className="px-4 py-3">{g.started}</td>
                <td className="px-4 py-3">{eur(g.expected)}</td>
                <td className="px-4 py-3">{eur(g.invoiced)}</td>
                <td className="px-4 py-3">{eur(g.paid)}</td>
              </tr>
            ))}
            {bySchool.size === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No applications yet.</td></tr>}
          </Table>
        </div>
      </section>

      <Card>
        <h2 className="text-lg font-semibold">Getting data in</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] text-ink-soft">
          <li><Link className="text-sea underline" href="/admin/institutions/new">Add an institution</Link> – tick “Partner” if you have a referral agreement.</li>
          <li><Link className="text-sea underline" href="/admin/programmes/new">Add its programmes</Link> – requirements, tuition, deadlines and source link.</li>
          <li>Tick “Published” to show it to members. Tick “Free preview” on 3–6 programmes to show them on the public site.</li>
        </ol>
      </Card>
    </div>
  );
}

function Stat({ k, v, sub, href, money }: { k: string; v: number; sub?: string; href?: string; money?: boolean }) {
  const body = (
    <>
      <p className="text-sm text-muted">{k}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold">{money ? eur(v) : v}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </>
  );
  const cls = "block rounded-[var(--radius-card)] border border-line bg-surface p-5";
  return href ? <Link href={href} className={`${cls} hover:border-ink/30`}>{body}</Link> : <div className={cls}>{body}</div>;
}
