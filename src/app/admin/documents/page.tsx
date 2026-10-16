import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { docLabel } from "@/lib/documents";
import { Callout, Card } from "@/components/ui";
import { DocReview } from "./review";

type Row = {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  status: string;
  reviewer_comment: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
};

export default async function DocumentsQueue({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  const { status = "uploaded", error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("id, user_id, document_type, file_name, status, reviewer_comment, created_at, profiles!documents_user_id_fkey(full_name, email)")
    .eq("status", status)
    .order("created_at", { ascending: true })
    .limit(300)
    .returns<Row[]>();

  // Group by student so a reviewer handles one person at a time
  const groups = new Map<string, Row[]>();
  for (const d of data ?? []) groups.set(d.user_id, [...(groups.get(d.user_id) ?? []), d]);

  const tabs = [
    ["uploaded", "Awaiting review"],
    ["rejected", "Rejected"],
    ["approved", "Approved"],
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold">Documents</h1>
      <p className="mt-2 text-ink-soft">Open each file, then approve it or reject it with a reason the student will see.</p>
      {error === "comment" && <div className="mt-4"><Callout tone="warn">Write a reason when rejecting a document.</Callout></div>}

      <div className="mt-6 flex flex-wrap gap-1.5">
        {tabs.map(([v, l]) => (
          <Link
            key={v}
            href={{ query: { status: v } }}
            className={`rounded-full px-3.5 py-1.5 text-sm ${status === v ? "bg-ink text-white" : "border border-line bg-surface text-ink-soft hover:text-ink"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {[...groups.entries()].map(([userId, docs]) => (
          <Card key={userId}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link href={`/admin/members/${userId}`} className="text-lg font-semibold hover:text-sea">
                {docs[0].profiles?.full_name ?? docs[0].profiles?.email}
              </Link>
              <span className="text-sm text-muted">{docs[0].profiles?.email}</span>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {docs.map((d) => (
                <li key={d.id} className="py-3">
                  <DocReview doc={{ ...d, docLabel: docLabel(d.document_type) }} back={`/admin/documents?status=${status}`} />
                </li>
              ))}
            </ul>
          </Card>
        ))}
        {groups.size === 0 && (
          <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface px-6 py-12 text-center text-muted">
            Nothing here.
          </div>
        )}
      </div>
    </div>
  );
}
