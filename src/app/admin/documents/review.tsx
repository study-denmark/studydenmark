import { reviewDocument } from "@/app/actions/admin-ops";
import { fmtDate, Pill } from "@/lib/admin-ui";

type Doc = {
  id: string;
  document_type: string;
  docLabel: string;
  file_name: string;
  status: string;
  reviewer_comment: string | null;
  created_at: string;
};

const statusPill = {
  uploaded: <Pill tone="amber">Awaiting review</Pill>,
  approved: <Pill tone="green">Approved</Pill>,
  rejected: <Pill tone="red">Rejected</Pill>,
} as Record<string, React.ReactNode>;

/** One document with open / approve / reject controls. */
export function DocReview({ doc, back }: { doc: Doc; back: string }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium">{doc.docLabel}</span>
        {statusPill[doc.status]}
        <a href={`/api/documents/${doc.id}`} target="_blank" rel="noopener" className="min-w-0 truncate text-sm text-sea underline underline-offset-2">
          {doc.file_name}
        </a>
        <span className="text-xs text-muted">{fmtDate(doc.created_at)}</span>
      </div>
      {doc.status === "rejected" && doc.reviewer_comment && <p className="text-sm text-ink-soft">“{doc.reviewer_comment}”</p>}
      <div className="flex flex-wrap items-start gap-2">
        {doc.status !== "approved" && (
          <form action={reviewDocument}>
            <input type="hidden" name="id" value={doc.id} />
            <input type="hidden" name="decision" value="approved" />
            <input type="hidden" name="back" value={back} />
            <button className="rounded-full bg-sea px-3.5 py-1.5 text-sm font-medium text-white hover:opacity-90">Approve</button>
          </form>
        )}
        {doc.status !== "rejected" && (
          <form action={reviewDocument} className="flex flex-1 flex-wrap gap-2">
            <input type="hidden" name="id" value={doc.id} />
            <input type="hidden" name="decision" value="rejected" />
            <input type="hidden" name="back" value={back} />
            <input
              name="comment"
              required
              placeholder="Reason, shown to the student (e.g. 'Page 2 is missing')"
              className="min-w-0 flex-1 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm"
            />
            <button className="rounded-full border border-accent/40 px-3.5 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft">Reject</button>
          </form>
        )}
        {doc.status !== "uploaded" && (
          <form action={reviewDocument}>
            <input type="hidden" name="id" value={doc.id} />
            <input type="hidden" name="decision" value="uploaded" />
            <input type="hidden" name="back" value={back} />
            <button className="rounded-full px-3 py-1.5 text-sm text-muted underline underline-offset-2 hover:text-ink">Undo</button>
          </form>
        )}
      </div>
    </div>
  );
}
