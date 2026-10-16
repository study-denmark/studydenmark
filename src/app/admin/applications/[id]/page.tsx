import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { countryName, EDUCATION_LEVELS } from "@/lib/constants";
import { APPLICATION_COLUMNS, docLabel, typeStatus, type StudentDocument, type DocumentType } from "@/lib/documents";
import { levelLabels } from "@/lib/labels";
import { adminStageLabels, eur, fmtDate, Pill } from "@/lib/admin-ui";
import { updateApplication } from "@/app/actions/admin-ops";
import { Button, Callout, Card, inputClass } from "@/components/ui";
import { DocReview } from "@/app/admin/documents/review";

const STAGES = ["interested", "documents_complete", "sent_to_school", "admitted", "started", "rejected", "withdrawn"];

export default async function ApplicationAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ exported?: string; error?: string }>;
}) {
  const { id } = await params;
  const { exported, error } = await searchParams;
  const supabase = await createClient();

  const { data: a } = await supabase
    .from("applications")
    .select(`${APPLICATION_COLUMNS}, programmes(id, slug, title, level, city, programme_required_documents(document_type)), institutions(id, name, is_partner, website)`)
    .eq("id", id)
    .maybeSingle<{
      id: string; user_id: string; stage: string; share_consent_at: string; share_consent_version: string;
      sent_to_school_at: string | null; admitted_at: string | null; started_at: string | null; created_at: string;
      programmes: { id: string; slug: string; title: string; level: keyof typeof levelLabels; city: string; programme_required_documents: { document_type: DocumentType }[] } | null;
      institutions: { id: string; name: string; is_partner: boolean; website: string | null } | null;
    }>();
  if (!a) notFound();

  const [{ data: p }, { data: docs }, { data: adm }, { data: deal }, { data: shares }, { data: history }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", a.user_id).single(),
    supabase.from("documents").select("id, document_type, file_name, status, reviewer_comment, created_at, storage_path, mime_type, size_bytes").eq("user_id", a.user_id).returns<StudentDocument[]>(),
    supabase.from("application_admin").select("*").eq("application_id", id).maybeSingle(),
    supabase.from("partner_agreements").select("commission_amount_eur").eq("institution_id", a.institutions?.id ?? "").maybeSingle(),
    supabase.from("document_shares").select("document_type, shared_at, method").eq("application_id", id).order("shared_at", { ascending: false }),
    supabase.from("application_stage_history").select("from_stage, to_stage, changed_at").eq("application_id", id).order("changed_at", { ascending: false }),
  ]);

  const required = a.programmes?.programme_required_documents.map((r) => r.document_type) ?? [];
  const byType = (t: string) => (docs ?? []).filter((d) => d.document_type === t);
  const checklist = required.map((t) => ({ t, status: typeStatus(byType(t)) }));
  const allApproved = checklist.length > 0 && checklist.every((c) => c.status === "approved");
  const approvedCount = (docs ?? []).filter((d) => d.status === "approved").length;
  const relevantDocs = (docs ?? []).filter((d) => required.length === 0 || required.includes(d.document_type) || ["cv", "motivation_letter", "recommendation", "other"].includes(d.document_type));

  return (
    <div className="space-y-6">
      <Link href="/admin/applications" className="text-sm text-muted hover:text-ink">← Applications</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold">{p?.full_name ?? p?.email}</h1>
        <Pill tone={adminStageLabels[a.stage]?.tone}>{adminStageLabels[a.stage]?.label ?? a.stage}</Pill>
      </div>
      <p className="text-ink-soft">
        {a.programmes?.title} · {a.institutions?.name}
        {a.institutions?.is_partner && " (partner)"} · requested {fmtDate(a.created_at)}
      </p>
      {exported && <Callout>Document package downloaded and logged as shared with {a.institutions?.name}.</Callout>}
      {error === "no-docs" && <Callout tone="warn">No approved documents to export yet. Approve documents first.</Callout>}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Documents</h2>
              <span className="text-sm text-muted">
                {checklist.filter((c) => c.status === "approved").length} of {checklist.length} required approved
              </span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {checklist.map((c) => (
                <li key={c.t}>
                  <Pill tone={c.status === "approved" ? "green" : c.status === "uploaded" ? "amber" : c.status === "rejected" ? "red" : "gray"}>
                    {docLabel(c.t)}: {c.status === "missing" ? "missing" : c.status}
                  </Pill>
                </li>
              ))}
            </ul>
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {relevantDocs.map((d) => (
                <li key={d.id} className="py-3">
                  <DocReview doc={{ ...d, docLabel: docLabel(d.document_type) }} back={`/admin/applications/${id}`} />
                </li>
              ))}
              {!relevantDocs.length && <li className="py-3 text-ink-soft">No documents uploaded yet.</li>}
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Send to school</h2>
            <p className="mt-2 text-[15px] text-ink-soft">
              Downloads a ZIP with the student’s <strong>approved</strong> documents and an applicant summary. Each file is
              logged as shared with {a.institutions?.name}, and the student can see the log.
            </p>
            {!allApproved && checklist.length > 0 && (
              <p className="mt-2 text-sm text-[#8A5A00]">Not all required documents are approved yet.</p>
            )}
            <a
              href={`/api/admin/applications/${id}/export`}
              className={`mt-4 inline-flex rounded-full px-5 py-3 font-medium ${approvedCount ? "bg-ink text-white hover:bg-ink-soft" : "pointer-events-none bg-paper text-muted"}`}
            >
              Download document package (.zip)
            </a>
            {a.institutions?.website && (
              <p className="mt-3 text-sm text-muted">School website: <a className="underline" href={a.institutions.website} target="_blank" rel="noopener noreferrer">{a.institutions.website}</a></p>
            )}
            {shares && shares.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm text-ink-soft">
                {shares.map((s, i) => (
                  <li key={i} className="flex justify-between"><span>{docLabel(s.document_type)}</span><span>{fmtDate(s.shared_at)} · {s.method}</span></li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Student</h2>
            <dl className="mt-3 grid gap-2 text-[15px] sm:grid-cols-2">
              <Row k="Email" v={p?.email} />
              <Row k="Nationality" v={`${countryName(p?.nationality) ?? "—"}${p?.is_eu_eea ? " (EU/EEA)" : ""}`} />
              <Row k="Education" v={EDUCATION_LEVELS.find((e) => e.value === p?.education_level)?.label} />
              <Row k="English" v={p?.english_test_type ? `${p.english_test_type} ${p.english_test_score ?? ""}` : undefined} />
              <Row k="Programme level" v={a.programmes ? levelLabels[a.programmes.level] : undefined} />
              <Row k="Consent" v={`${fmtDate(a.share_consent_at)} (${a.share_consent_version})`} />
            </dl>
            <Link href={`/admin/members/${a.user_id}`} className="mt-3 inline-block text-sm text-sea underline">Open member →</Link>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="lg:sticky lg:top-24">
            <form action={updateApplication} className="space-y-4">
              <input type="hidden" name="id" value={a.id} />
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Stage</span>
                <select name="stage" defaultValue={a.stage} className={inputClass}>
                  {STAGES.map((s) => <option key={s} value={s}>{adminStageLabels[s].label}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Commission</span>
                  <select name="commission_status" defaultValue={adm?.commission_status ?? "none"} className={inputClass}>
                    <option value="none">—</option>
                    <option value="expected">Expected</option>
                    <option value="invoiced">Invoiced</option>
                    <option value="paid">Paid</option>
                    <option value="not_due">Not due</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Amount €</span>
                  <input name="commission_amount_eur" type="number" defaultValue={adm?.commission_amount_eur ?? deal?.commission_amount_eur ?? ""} className={inputClass} />
                </label>
              </div>
              {deal && <p className="-mt-2 text-xs text-muted">Agreement with school: {eur(deal.commission_amount_eur)} per student</p>}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Internal notes</span>
                <textarea name="internal_notes" rows={4} defaultValue={adm?.internal_notes ?? ""} className={inputClass} placeholder="Never shown to the student" />
              </label>
              <Button type="submit" className="w-full">Save</Button>
            </form>
            <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
              <Row k="Sent to school" v={fmtDate(a.sent_to_school_at)} />
              <Row k="Admitted" v={fmtDate(a.admitted_at)} />
              <Row k="Started" v={fmtDate(a.started_at)} />
              <Row k="Invoiced" v={fmtDate(adm?.commission_invoiced_at)} />
              <Row k="Paid" v={fmtDate(adm?.commission_paid_at)} />
            </dl>
            {history && history.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-line pt-4 text-xs text-muted">
                {history.map((h, i) => (
                  <li key={i}>{fmtDate(h.changed_at)}: {h.from_stage ? `${adminStageLabels[h.from_stage]?.label} → ` : ""}{adminStageLabels[h.to_stage]?.label}</li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="text-right">{v || "—"}</dd></div>
  );
}
