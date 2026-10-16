import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSubscriber } from "@/lib/auth";
import { docLabel, typeStatus, type DocumentType, type StudentDocument } from "@/lib/documents";
import { levelLabels } from "@/lib/labels";
import { CheckIcon } from "@/components/programme-card";
import { Card, PartnerBadge } from "@/components/ui";
import { ApplyForm } from "./form";

export const metadata: Metadata = { title: "Apply with our help" };

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, user, profile } = await requireSubscriber();
  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  const { data: p } = await supabase
    .from("programmes")
    .select("id, slug, title, level, city, is_published, institutions(name, is_partner), programme_required_documents(document_type)")
    .eq("slug", slug)
    .maybeSingle<{
      id: string;
      slug: string;
      title: string;
      level: keyof typeof levelLabels;
      city: string;
      is_published: boolean;
      institutions: { name: string; is_partner: boolean } | null;
      programme_required_documents: { document_type: DocumentType }[];
    }>();
  if (!p || !p.is_published) notFound();

  const [{ data: existing }, { data: docs }] = await Promise.all([
    supabase.from("applications").select("id").eq("user_id", user!.id).eq("programme_id", p.id).maybeSingle(),
    supabase
      .from("documents")
      .select("id, document_type, status")
      .eq("user_id", user!.id)
      .returns<Pick<StudentDocument, "id" | "document_type" | "status">[]>(),
  ]);
  if (existing) redirect("/dashboard/applications");

  const required = p.programme_required_documents.map((r) => r.document_type);
  const checklist = required.map((t) => {
    const s = typeStatus((docs ?? []).filter((d) => d.document_type === t) as StudentDocument[]);
    return { type: t, status: s };
  });
  const missing = checklist.filter((c) => c.status === "missing" || c.status === "rejected").length;
  const schoolName = p.institutions?.name ?? "the school";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/dashboard/programmes/${p.slug}`} className="text-sm text-muted hover:text-ink">← Back to programme</Link>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Apply with our help</h1>
      <p className="mt-3 text-ink-soft">
        We review your documents, make sure your application is complete and send it to the school for you. It’s
        included in your membership.
      </p>

      <Card className="mt-8">
        <p className="text-sm text-muted">{levelLabels[p.level]} · {p.city}</p>
        <h2 className="mt-1 text-xl font-semibold">{p.title}</h2>
        <div className="mt-1 flex items-center gap-2 text-ink-soft">
          {schoolName} {p.institutions?.is_partner && <PartnerBadge />}
        </div>
      </Card>

      {checklist.length > 0 && (
        <Card className="mt-4">
          <h2 className="text-lg font-semibold">Documents for this programme</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {checklist.map((c) => (
              <li key={c.type} className="flex items-center gap-2">
                <CheckIcon ok={c.status === "approved" || c.status === "uploaded" ? true : c.status === "rejected" ? false : null} />
                <span className="flex-1">{docLabel(c.type)}</span>
                <span className="text-sm text-muted">
                  {c.status === "missing" ? "Not uploaded" : c.status === "uploaded" ? "Uploaded" : c.status === "approved" ? "Approved" : "Needs a new file"}
                </span>
              </li>
            ))}
          </ul>
          {missing > 0 && (
            <p className="mt-4 rounded-lg bg-paper px-3 py-2.5 text-sm text-ink-soft">
              You can send your request now and upload the {missing === 1 ? "last document" : `${missing} missing documents`}{" "}
              afterwards. <Link href="/dashboard/documents" className="text-sea underline">Upload documents</Link>
            </p>
          )}
        </Card>
      )}

      <ApplyForm programmeId={p.id} schoolName={schoolName} isPartner={!!p.institutions?.is_partner} />
    </div>
  );
}
