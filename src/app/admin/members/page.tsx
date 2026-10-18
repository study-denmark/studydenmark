import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { countryName } from "@/lib/constants";
import { fmtDate, Pill, subTone, Table } from "@/lib/admin-ui";
import { subscriptionStatusLabels } from "@/lib/labels";
import { Callout, inputClass } from "@/components/ui";

type Row = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  nationality: string | null;
  field_of_interest: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  subscriptions: { status: string; plan: string; current_period_end: string | null }[];
  documents: { count: number }[];
  applications: { id: string }[];
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; deleted?: string }>;
}) {
  const { q, filter, deleted } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, nationality, field_of_interest, onboarding_completed_at, created_at, subscriptions(status, plan, current_period_end), documents!documents_user_id_fkey(count), applications(id)",
    )
    .order("created_at", { ascending: false })
    .limit(500);
  if (q) query = query.or(`email.ilike.%${q.replace(/[%,()]/g, "")}%,full_name.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data } = await query.returns<Row[]>();

  const live = (r: Row) =>
    r.subscriptions.filter((s) => ["active", "trialing"].includes(s.status) && (!s.current_period_end || new Date(s.current_period_end) > new Date()));
  const isActive = (r: Row) => live(r).length > 0;
  const planOf = (r: Row) => (live(r).some((s) => s.plan === "premium") ? "premium" : isActive(r) ? "basic" : null);
  let rows = data ?? [];
  if (filter === "active") rows = rows.filter(isActive);
  if (filter === "basic") rows = rows.filter((r) => planOf(r) === "basic");
  if (filter === "premium") rows = rows.filter((r) => planOf(r) === "premium");
  if (filter === "inactive") rows = rows.filter((r) => !isActive(r) && r.role !== "admin");
  if (filter === "no-profile") rows = rows.filter((r) => !r.onboarding_completed_at);
  if (filter === "admins") rows = rows.filter((r) => r.role === "admin");

  const tabs = [
    ["", "All"],
    ["active", "Paying"],
    ["basic", "Basic"],
    ["premium", "Premium"],
    ["inactive", "Not paying"],
    ["no-profile", "No profile yet"],
    ["admins", "Admins"],
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold">Members</h1>
      {deleted && <div className="mt-4"><Callout>Member deleted.</Callout></div>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map(([v, l]) => (
            <Link
              key={v}
              href={{ query: { ...(q ? { q } : {}), ...(v ? { filter: v } : {}) } }}
              className={`rounded-full px-3.5 py-1.5 text-sm ${(filter ?? "") === v ? "bg-ink text-white" : "border border-line bg-surface text-ink-soft hover:text-ink"}`}
            >
              {l}
            </Link>
          ))}
        </div>
        <form className="flex gap-2">
          {filter && <input type="hidden" name="filter" value={filter} />}
          <input name="q" defaultValue={q} placeholder="Search name or email" className={`${inputClass} py-2 sm:w-64`} />
        </form>
      </div>

      <p className="mt-4 text-sm text-muted">{rows.length} member{rows.length === 1 ? "" : "s"}</p>
      <div className="mt-2">
        <Table head={["Member", "Country", "Interest", "Membership", "Docs", "Apps", "Joined"]} minWidth={820}>
          {rows.map((r) => {
            const plan = planOf(r);
            const sub = live(r).find((s) => s.plan === plan) ?? r.subscriptions[0];
            return (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/admin/members/${r.id}`} className="font-medium hover:text-sea">{r.full_name ?? "—"}</Link>
                  {r.role === "admin" && <span className="ml-2"><Pill tone="ink">Admin</Pill></span>}
                  <p className="text-xs text-muted">{r.email}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{countryName(r.nationality) ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-ink-soft">{r.onboarding_completed_at ? r.field_of_interest : <Pill>No profile</Pill>}</td>
                <td className="px-4 py-3">
                  {plan ? (
                    <Pill tone={plan === "premium" ? "ink" : "green"}>{plan === "premium" ? "Premium" : "Basic"}</Pill>
                  ) : sub ? (
                    <Pill tone={subTone(sub.status)}>{subscriptionStatusLabels[sub.status] ?? sub.status}</Pill>
                  ) : (
                    <Pill>None</Pill>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft">{r.documents[0]?.count ?? 0}</td>
                <td className="px-4 py-3 text-ink-soft">{r.applications.length}</td>
                <td className="px-4 py-3 text-sm text-ink-soft">{fmtDate(r.created_at)}</td>
              </tr>
            );
          })}
          {!rows.length && (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">No members found.</td></tr>
          )}
        </Table>
      </div>
    </div>
  );
}
