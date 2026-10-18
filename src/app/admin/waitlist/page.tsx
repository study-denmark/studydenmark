import { createClient } from "@/lib/supabase/server";
import { fmtDate, Table } from "@/lib/admin-ui";

export default async function WaitlistPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("waitlist")
    .select("id, email, created_at, notified_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  const list = rows ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Waitlist</h1>
          <p className="mt-1 text-ink-soft">
            {list.length} {list.length === 1 ? "person wants" : "people want"} an email when the site opens.
          </p>
        </div>
        <a
          href="/api/admin/waitlist/export"
          className="rounded-full border border-line bg-surface px-5 py-2.5 text-[15px] font-medium hover:border-ink/40"
        >
          Download CSV
        </a>
      </div>
      <p className="mt-3 text-sm text-muted">
        Only use these addresses for the launch email – that’s what people signed up for. Entries are deleted
        automatically after 12 months.
      </p>
      <div className="mt-6">
        <Table head={["Email", "Signed up", "Notified"]} minWidth={520}>
          {list.map((r) => (
            <tr key={r.id} className="border-t border-line">
              <td className="px-4 py-3">{r.email}</td>
              <td className="px-4 py-3 text-ink-soft">{fmtDate(r.created_at)}</td>
              <td className="px-4 py-3 text-ink-soft">{r.notified_at ? fmtDate(r.notified_at) : "—"}</td>
            </tr>
          ))}
          {!list.length && (
            <tr><td colSpan={3} className="px-4 py-10 text-center text-muted">No sign-ups yet.</td></tr>
          )}
        </Table>
      </div>
    </div>
  );
}
