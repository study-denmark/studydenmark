export type DocumentType =
  | "passport"
  | "diploma"
  | "transcript"
  | "language_test"
  | "cv"
  | "motivation_letter"
  | "recommendation"
  | "other";

export const DOCUMENT_TYPES: { value: DocumentType; label: string; help: string }[] = [
  { value: "passport", label: "Passport", help: "The photo page. Must be valid for your whole study period if possible." },
  { value: "diploma", label: "Diploma(s)", help: "Upper secondary diploma. Add your bachelor’s diploma if you’re applying for a master’s." },
  { value: "transcript", label: "Transcript of grades", help: "All subjects and grades. Include a certified English translation if needed." },
  { value: "language_test", label: "English test result", help: "IELTS, TOEFL, Cambridge, PTE or Duolingo test report." },
  { value: "cv", label: "CV", help: "One or two pages, in English." },
  { value: "motivation_letter", label: "Motivation letter", help: "Why this programme and why Denmark. Usually max. one page." },
  { value: "recommendation", label: "Letter of recommendation", help: "From a teacher or employer, if the programme asks for it." },
  { value: "other", label: "Other documents", help: "Translations, course descriptions, portfolio or anything else requested." },
];

export const docLabel = (t: string) => DOCUMENT_TYPES.find((d) => d.value === t)?.label ?? t;

/** Documents every application needs, used when nothing is saved yet. */
export const CORE_DOCUMENTS: DocumentType[] = ["passport", "diploma", "transcript", "language_test"];

export const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/webp"];
export const MAX_BYTES = 10 * 1024 * 1024;

export type StudentDocument = {
  id: string;
  document_type: DocumentType;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  status: "uploaded" | "approved" | "rejected";
  reviewer_comment: string | null;
  created_at: string;
};

/** Best status for a document type across all files of that type. */
export function typeStatus(files: StudentDocument[]): "missing" | "uploaded" | "approved" | "rejected" {
  if (!files.length) return "missing";
  if (files.some((f) => f.status === "approved")) return "approved";
  if (files.some((f) => f.status === "uploaded")) return "uploaded";
  return "rejected";
}

// Columns students may read on applications (commercial fields live in application_admin).
export const APPLICATION_COLUMNS =
  "id, user_id, programme_id, institution_id, stage, share_consent_at, share_consent_version, sent_to_school_at, admitted_at, started_at, created_at, updated_at";

export const studentStageLabels: Record<string, { label: string; tone: "neutral" | "progress" | "good" | "bad" }> = {
  interested: { label: "Request received", tone: "neutral" },
  documents_complete: { label: "Documents approved", tone: "progress" },
  sent_to_school: { label: "Sent to school", tone: "progress" },
  admitted: { label: "Admitted", tone: "good" },
  started: { label: "Studying", tone: "good" },
  commission_invoiced: { label: "Studying", tone: "good" },
  commission_paid: { label: "Studying", tone: "good" },
  rejected: { label: "Not admitted", tone: "bad" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};

export const SHARE_CONSENT_VERSION = "share-v1-2026-10";
