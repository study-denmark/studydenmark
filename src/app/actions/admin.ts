"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");
  return supabase; // RLS also enforces admin-only writes
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const str = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};
const num = (f: FormData, k: string) => {
  const v = str(f, k);
  if (v == null) return null;
  const n = Number(v.replace(",", "."));
  return Number.isNaN(n) ? null : n;
};

export type AdminState = { error: string | null };

export async function saveInstitution(_prev: AdminState, f: FormData): Promise<AdminState> {
  const supabase = await adminClient();
  const id = str(f, "id");
  const name = str(f, "name");
  if (!name) return { error: "Name is required." };

  const row = {
    name,
    slug: str(f, "slug") ?? slugify(name),
    type: str(f, "type") ?? "business_academy",
    city: str(f, "city"),
    website: str(f, "website"),
    description: str(f, "description"),
    is_partner: f.get("is_partner") === "on",
  };

  const { error } = id
    ? await supabase.from("institutions").update(row).eq("id", id)
    : await supabase.from("institutions").insert(row);
  if (error) return { error: error.code === "23505" ? "An institution with this slug already exists." : error.message };

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  redirect("/admin/institutions");
}

export async function deleteInstitution(f: FormData) {
  const supabase = await adminClient();
  const id = str(f, "id");
  if (id) await supabase.from("institutions").delete().eq("id", id);
  revalidatePath("/admin", "layout");
  redirect("/admin/institutions");
}

const DOC_TYPES = ["passport", "diploma", "transcript", "language_test", "cv", "motivation_letter", "recommendation"];
const EDU = ["upper_secondary", "academy_profession", "bachelor", "master"];

export async function saveProgramme(_prev: AdminState, f: FormData): Promise<AdminState> {
  const supabase = await adminClient();
  const id = str(f, "id");
  const title = str(f, "title");
  const institutionId = str(f, "institution_id");
  if (!title || !institutionId) return { error: "Title and institution are required." };
  if (!str(f, "city") || !str(f, "field") || !str(f, "level")) return { error: "Level, field and city are required." };

  let slug = str(f, "slug");
  if (!slug) {
    const { data: inst } = await supabase.from("institutions").select("slug").eq("id", institutionId).single();
    slug = slugify(`${title} ${inst?.slug ?? ""}`);
  }

  const row = {
    institution_id: institutionId,
    slug,
    title,
    level: str(f, "level"),
    field: str(f, "field"),
    city: str(f, "city"),
    description: str(f, "description"),
    duration_months: num(f, "duration_months"),
    ects: num(f, "ects"),
    tuition_eu_eur_per_year: num(f, "tuition_eu_eur_per_year") ?? 0,
    tuition_non_eu_eur_per_year: num(f, "tuition_non_eu_eur_per_year"),
    application_deadline_eu: str(f, "application_deadline_eu"),
    application_deadline_non_eu: str(f, "application_deadline_non_eu"),
    intake: str(f, "intake"),
    admission_requirements: str(f, "admission_requirements"),
    language_requirements: str(f, "language_requirements"),
    min_ielts: num(f, "min_ielts"),
    min_toefl: num(f, "min_toefl"),
    accepted_education_levels: f.getAll("accepted_education_levels").map(String).filter((v) => EDU.includes(v)),
    source_url: str(f, "source_url"),
    last_verified_at: str(f, "last_verified_at"),
    is_published: f.get("is_published") === "on",
    is_public_preview: f.get("is_public_preview") === "on",
  };

  const res = id
    ? await supabase.from("programmes").update(row).eq("id", id).select("id").single()
    : await supabase.from("programmes").insert(row).select("id").single();
  if (res.error)
    return { error: res.error.code === "23505" ? "A programme with this slug already exists." : res.error.message };

  // Required documents: replace the set
  const programmeId = res.data.id as string;
  const docs = f.getAll("documents").map(String).filter((d) => DOC_TYPES.includes(d));
  await supabase.from("programme_required_documents").delete().eq("programme_id", programmeId);
  if (docs.length) {
    await supabase
      .from("programme_required_documents")
      .insert(docs.map((d) => ({ programme_id: programmeId, document_type: d })));
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/programmes");
  redirect("/admin/programmes");
}

export async function deleteProgramme(f: FormData) {
  const supabase = await adminClient();
  const id = str(f, "id");
  if (id) {
    const { error } = await supabase.from("programmes").delete().eq("id", id);
    if (error) redirect(`/admin/programmes/${id}?error=in-use`);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/programmes");
}
