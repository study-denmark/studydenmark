import type { ReactNode } from "react";

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const eur = (n?: number | null) => (n == null ? "—" : `€${n.toLocaleString("en")}`);

const tones = {
  gray: "bg-paper text-muted",
  ink: "bg-paper text-ink",
  amber: "bg-[#FFF4DB] text-[#8A5A00]",
  green: "bg-sea-soft text-sea",
  red: "bg-accent-soft text-accent",
} as const;

export function Pill({ tone = "gray", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}

export const subTone = (status?: string | null): keyof typeof tones =>
  status === "active" || status === "trialing" ? "green" : status === "past_due" || status === "unpaid" ? "red" : "gray";

export const adminStageLabels: Record<string, { label: string; tone: keyof typeof tones }> = {
  interested: { label: "New request", tone: "amber" },
  documents_complete: { label: "Docs complete", tone: "ink" },
  sent_to_school: { label: "Sent to school", tone: "ink" },
  admitted: { label: "Admitted", tone: "green" },
  started: { label: "Started", tone: "green" },
  commission_invoiced: { label: "Started", tone: "green" },
  commission_paid: { label: "Started", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  withdrawn: { label: "Withdrawn", tone: "gray" },
};

export const commissionLabels: Record<string, { label: string; tone: keyof typeof tones }> = {
  none: { label: "—", tone: "gray" },
  expected: { label: "Expected", tone: "amber" },
  invoiced: { label: "Invoiced", tone: "ink" },
  paid: { label: "Paid", tone: "green" },
  not_due: { label: "Not due", tone: "gray" },
};

export function Table({ head, children, minWidth = 640 }: { head: string[]; children: ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
      <table className="w-full text-left text-[15px]" style={{ minWidth }}>
        <thead className="bg-paper text-sm text-muted">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
