import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Programme } from "@/lib/types";
import { Callout } from "@/components/ui";
import { ProgrammeForm } from "./form";

export default async function EditProgramme({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: institutions } = await supabase.from("institutions").select("id, name, city").order("name");
  let programme: Programme | null = null;
  let docs: string[] = [];
  if (id !== "new") {
    const { data } = await supabase.from("programmes").select("*").eq("id", id).maybeSingle<Programme>();
    if (!data) notFound();
    programme = data;
    const { data: d } = await supabase.from("programme_required_documents").select("document_type").eq("programme_id", id);
    docs = (d ?? []).map((x) => x.document_type as string);
  }

  if (!institutions?.length) {
    return (
      <Callout>
        Add an institution first. <Link href="/admin/institutions/new" className="underline">Add institution →</Link>
      </Callout>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold">{programme ? programme.title : "New programme"}</h1>
      {programme?.is_published && (
        <Link href={`/dashboard/programmes/${programme.slug}`} className="mt-2 inline-block text-sm text-sea underline">
          View as student →
        </Link>
      )}
      {error === "in-use" && (
        <div className="mt-4"><Callout tone="warn">Can’t delete: students have applied to this programme. Unpublish it instead.</Callout></div>
      )}
      <ProgrammeForm programme={programme} institutions={institutions} docs={docs} />
    </div>
  );
}
