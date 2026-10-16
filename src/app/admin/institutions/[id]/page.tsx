import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Institution } from "@/lib/types";
import { InstitutionForm } from "./form";

export default async function EditInstitution({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let institution: Institution | null = null;
  if (id !== "new") {
    const supabase = await createClient();
    const { data } = await supabase.from("institutions").select("*").eq("id", id).maybeSingle<Institution>();
    if (!data) notFound();
    institution = data;
  }
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold">{institution ? institution.name : "New institution"}</h1>
      <InstitutionForm institution={institution} />
    </div>
  );
}
