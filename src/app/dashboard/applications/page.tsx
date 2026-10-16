import type { Metadata } from "next";
import Link from "next/link";
import { requireSubscriber } from "@/lib/auth";
import { APPLICATION_COLUMNS, docLabel, studentStageLabels } from "@/lib/documents";
import { levelLabels } from "@/lib/labels";
import { ButtonLink, Callout, PartnerBadge } from "@/components/ui";

export const metadata: Metadata = { title: "My applications" };

type App = {
  id: string;
  stage: string;
  share_consent_at: string;
  sent_to_school_at: string | null;
  admitted_at: string | null;
  created_at: string;
  programmes: { slug: string; title: string; level: keyof typeof levelLabels; city: string } | null;
  institutions: { name: string; is_partner: boolean } | null;
};

const toneCls = {
  neutral: "bg-paper text-ink",
  progress: "bg-[#FFF4DB] text-[#8A5A00]",
  good: "bg-sea-soft text-sea",
  bad: "bg-accent-soft text-accent",
} as const;

const steps = ["interested", "documents_complete", "sent_to_school", "admitted"] as const;
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const { supabase, user } = await requireSubscriber();
  const { new: isNew } = await searchParams;

  const [{ data: apps }, { data: shares }] = await Promise.all([
    supabase
      .from("applications")
      .select(`${APPLICATION_COLUMNS}, programmes(slug, title, level, city), institutions(name, is_partner)`)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<App[]>(),
    supabase
      .from("document_shares")
      .select("id, document_type, shared_at, method, institutions(name)")
      .eq("user_id", user!.id)
      .order("shared_at", { ascending: false })
      .returns<{ id: string; document_type: string; shared_at: string; method: string; institutions: { name: string } | null }[]>(),
  ]);

  return (
    <div className="space-y-10">
      {isNew && (
        <Callout>
          <strong>Request received.</strong> We’ll review your documents within a few working days and tell you if
          anything is missing. Make sure everything on your checklist is uploaded.
        </Callout>
      )}

      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">My applications</h1>
        <p className="mt-2 text-ink-soft">Programmes you’ve asked us to help you apply for.</p>
      </div>

      {apps && apps.length > 0 ? (
        <ul className="space-y-4">
          {apps.map((a) => {
            const st = studentStageLabels[a.stage] ?? { label: a.stage, tone: "neutral" as const };
            const idx = steps.indexOf(a.stage as (typeof steps)[number]);
            const reached = ["started", "commission_invoiced", "commission_paid"].includes(a.stage) ? steps.length - 1 : idx;
            return (
              <li key={a.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link href={`/dashboard/programmes/${a.programmes?.slug}`} className="text-lg font-semibold hover:text-sea">
                      {a.programmes?.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                      {a.institutions?.name} {a.institutions?.is_partner && <PartnerBadge />}
                      <span className="text-muted">· requested {fmt(a.created_at)}</span>
                    </div>
                  </div>
                  <span className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${toneCls[st.tone]}`}>{st.label}</span>
                </div>
                {reached >= 0 && (
                  <ol className="mt-5 grid grid-cols-4 gap-2">
                    {steps.map((s, i) => (
                      <li key={s}>
                        <div className={`h-1.5 rounded-full ${i <= reached ? "bg-sea" : "bg-line"}`} />
                        <p className={`mt-1.5 text-[11px] leading-tight sm:text-xs ${i <= reached ? "text-ink" : "text-muted"}`}>
                          {studentStageLabels[s].label}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface px-6 py-12 text-center">
          <p className="font-semibold">No applications yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Open a programme you like and choose “Apply with our help”.
          </p>
          <ButtonLink href="/dashboard/saved" className="mt-6">Go to saved programmes</ButtonLink>
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold">Who has received my documents</h2>
        <p className="mt-1 text-sm text-ink-soft">Every time we share a document with a school, it’s logged here.</p>
        {shares && shares.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
            <table className="w-full min-w-[480px] text-left text-[15px]">
              <thead className="bg-paper text-sm text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Document</th>
                  <th className="px-4 py-2.5 font-medium">Shared with</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {shares.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="px-4 py-3">{docLabel(s.document_type)}</td>
                    <td className="px-4 py-3 text-ink-soft">{s.institutions?.name}</td>
                    <td className="px-4 py-3 text-ink-soft">{fmt(s.shared_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-sm text-muted">Nothing has been shared yet.</p>
        )}
      </section>
    </div>
  );
}
