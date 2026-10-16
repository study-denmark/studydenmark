import type { Metadata } from "next";
import Link from "next/link";
import { requireSubscriber } from "@/lib/auth";
import {
  CORE_DOCUMENTS,
  DOCUMENT_TYPES,
  typeStatus,
  type DocumentType,
  type StudentDocument,
} from "@/lib/documents";
import { deleteDocument } from "@/app/actions/documents";
import { DocumentUploader } from "@/components/document-uploader";
import { Callout } from "@/components/ui";

export const metadata: Metadata = { title: "My documents" };

const statusStyle = {
  missing: { label: "Missing", cls: "bg-paper text-muted" },
  uploaded: { label: "Awaiting review", cls: "bg-[#FFF4DB] text-[#8A5A00]" },
  approved: { label: "Approved", cls: "bg-sea-soft text-sea" },
  rejected: { label: "Needs a new file", cls: "bg-accent-soft text-accent" },
} as const;

export default async function DocumentsPage() {
  const { supabase, user } = await requireSubscriber();

  const [{ data: docs }, { data: saved }] = await Promise.all([
    supabase
      .from("documents")
      .select("id, document_type, storage_path, file_name, mime_type, size_bytes, status, reviewer_comment, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<StudentDocument[]>(),
    supabase
      .from("saved_programmes")
      .select("programmes(title, programme_required_documents(document_type))")
      .eq("user_id", user!.id)
      .returns<{ programmes: { title: string; programme_required_documents: { document_type: DocumentType }[] } | null }[]>(),
  ]);

  // Which programmes need which document type
  const neededBy = new Map<DocumentType, string[]>();
  for (const s of saved ?? []) {
    for (const r of s.programmes?.programme_required_documents ?? []) {
      neededBy.set(r.document_type, [...(neededBy.get(r.document_type) ?? []), s.programmes!.title]);
    }
  }
  const required = new Set<DocumentType>(neededBy.size ? neededBy.keys() : CORE_DOCUMENTS);
  const byType = (t: DocumentType) => (docs ?? []).filter((d) => d.document_type === t);

  const requiredTypes = DOCUMENT_TYPES.filter((d) => required.has(d.value));
  const optionalTypes = DOCUMENT_TYPES.filter((d) => !required.has(d.value));
  const done = requiredTypes.filter((d) => typeStatus(byType(d.value)) !== "missing" && typeStatus(byType(d.value)) !== "rejected").length;
  const approved = requiredTypes.filter((d) => typeStatus(byType(d.value)) === "approved").length;
  const pct = requiredTypes.length ? Math.round((done / requiredTypes.length) * 100) : 0;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">My documents</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            {neededBy.size
              ? "Your checklist is based on the programmes you’ve saved."
              : "These are the documents almost every programme asks for. Save programmes to get an exact checklist."}{" "}
            We check each file before anything is sent to a school.
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted">Checklist</p>
            <p className="text-sm font-medium">{done} of {requiredTypes.length} uploaded</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
            <div className="h-full rounded-full bg-sea transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">{approved} approved by our team</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold">Required</h2>
        <ul className="mt-4 space-y-3">
          {requiredTypes.map((d) => (
            <DocRow key={d.value} userId={user!.id} type={d} files={byType(d.value)} neededBy={neededBy.get(d.value)} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Optional</h2>
        <p className="mt-1 text-sm text-ink-soft">Upload these if a programme asks for them – it speeds things up later.</p>
        <ul className="mt-4 space-y-3">
          {optionalTypes.map((d) => (
            <DocRow key={d.value} userId={user!.id} type={d} files={byType(d.value)} />
          ))}
        </ul>
      </section>

      <Callout>
        <strong>Your files are private.</strong> They’re stored encrypted in the EU and only you and our review team
        can open them. A school only receives your documents after you ask us to apply there on your behalf.{" "}
        <Link href="/dashboard/applications" className="underline">See who has received your documents</Link>.
      </Callout>
    </div>
  );
}

function DocRow({
  userId,
  type,
  files,
  neededBy,
}: {
  userId: string;
  type: (typeof DOCUMENT_TYPES)[number];
  files: StudentDocument[];
  neededBy?: string[];
}) {
  const status = typeStatus(files);
  const s = statusStyle[status];
  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{type.label}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">{type.help}</p>
          {neededBy && neededBy.length > 0 && (
            <p className="mt-1 text-xs text-muted">
              Needed for: {neededBy.slice(0, 3).join(", ")}
              {neededBy.length > 3 && ` +${neededBy.length - 3} more`}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <DocumentUploader userId={userId} type={type.value} label={type.label} />
        </div>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {files.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
              <a href={`/api/documents/${f.id}`} target="_blank" rel="noopener" className="min-w-0 flex-1 truncate font-medium text-ink hover:text-sea">
                {f.file_name}
              </a>
              <span className="text-xs text-muted">
                {f.size_bytes ? `${Math.max(1, Math.round(f.size_bytes / 1024))} KB · ` : ""}
                {new Date(f.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyle[f.status].cls}`}>{statusStyle[f.status].label}</span>
              {f.status !== "approved" && (
                <form action={deleteDocument}>
                  <input type="hidden" name="id" value={f.id} />
                  <button type="submit" className="text-xs text-muted underline underline-offset-2 hover:text-accent">Remove</button>
                </form>
              )}
              {f.status === "rejected" && f.reviewer_comment && (
                <p className="w-full rounded-lg bg-accent-soft px-3 py-2 text-[13px] text-ink">{f.reviewer_comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
