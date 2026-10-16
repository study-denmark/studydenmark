import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_COLUMNS } from "@/lib/documents";
import { adminStageLabels, commissionLabels, eur, fmtDate, Pill, Table } from "@/lib/admin-ui";

type Row = {
  id: string;
  user_id: string;
  stage: string;
  institution_id: string;
  created_at: string;
  updated_at: string;
  programmes: { title: string } | null;
  institutions: { name: string; is_partner: boolean } | null;
  profiles: { full_name: string | null; email: string; nationality: string | null } | null;
  application_admin: { commission_status: string; commission_amount_eur: number | null } | null;
};

const PIPELINE = ["interested", "documents_complete", "sent_to_school", "admitted", "started"];

export default async function ApplicationsAdmin({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const { stage } = await searchParams;
  const supabase = await createClient();
  let q = supabase
    .from("applications")
    .select(
      `${APPLICATION_COLUMNS}, programmes(title), institutions(name, is_partner), profiles(full_name, email, nationality), application_admin(commission_status, commission_amount_eur)`,
    )
    .order("updated_at", { ascending: false })
    .limit(500);
  if (stage) q = q.eq("stage", stage);
  const { data } = await q.returns<Row[]>();

  const { data: all } = await supabase.from("applications").select("stage");
  const counts = new Map<string, number>();
  for (const a of all ?? []) counts.set(a.stage, (counts.get(a.stage) ?? 0) + 1);

  return (
    <div>
      <h1 className="text-3xl font-semibold">Applications</h1>
      <p className="mt-2 text-ink-soft">Every “apply with our help” request, from new request to commission paid.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <StageTile href={{}} label="All" n={all?.length ?? 0} active={!stage} />
        {PIPELINE.map((s) => (
          <StageTile key={s} href={{ query: { stage: s } }} label={adminStageLabels[s].label} n={counts.get(s) ?? 0} active={stage === s} />
        ))}
      </div>

      <div className="mt-6">
        <Table head={["Student", "Programme", "Stage", "Commission", "Updated"]} minWidth={760}>
          {(data ?? []).map((a) => {
            const st = adminStageLabels[a.stage] ?? { label: a.stage, tone: "gray" as const };
            const cm = commissionLabels[a.application_admin?.commission_status ?? "none"];
            return (
              <tr key={a.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/admin/applications/${a.id}`} className="font-medium hover:text-sea">
                    {a.profiles?.full_name ?? a.profiles?.email}
                  </Link>
                  <p className="text-xs text-muted">{a.profiles?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{a.programmes?.title}</p>
                  <p className="text-xs text-muted">{a.institutions?.name}{a.institutions?.is_partner ? " · Partner" : ""}</p>
                </td>
                <td className="px-4 py-3"><Pill tone={st.tone}>{st.label}</Pill></td>
                <td className="px-4 py-3 text-sm">
                  {a.application_admin?.commission_status && a.application_admin.commission_status !== "none" ? (
                    <span className="flex items-center gap-2"><Pill tone={cm.tone}>{cm.label}</Pill>{eur(a.application_admin.commission_amount_eur)}</span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-ink-soft">{fmtDate(a.updated_at)}</td>
              </tr>
            );
          })}
          {!data?.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No applications.</td></tr>}
        </Table>
      </div>
    </div>
  );
}

function StageTile({ href, label, n, active }: { href: object; label: string; n: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-xl border px-3 py-2.5 ${active ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink/30"}`}
    >
      <p className={`text-xs ${active ? "text-white/70" : "text-muted"}`}>{label}</p>
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">{n}</p>
    </Link>
  );
}
