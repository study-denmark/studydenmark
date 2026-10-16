import { NextResponse } from "next/server";
import { zipSync, strToU8 } from "fflate";
import { createClient } from "@/lib/supabase/server";
import { countryName, EDUCATION_LEVELS } from "@/lib/constants";
import { docLabel } from "@/lib/documents";

export const runtime = "nodejs";

// Builds a ZIP of the student's APPROVED documents for one application and logs every share.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: app } = await supabase
    .from("applications")
    .select("id, user_id, institution_id, stage, share_consent_at, programmes(title), institutions(name)")
    .eq("id", id)
    .maybeSingle<{ id: string; user_id: string; institution_id: string; stage: string; share_consent_at: string; programmes: { title: string } | null; institutions: { name: string } | null }>();
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (["withdrawn", "rejected"].includes(app.stage)) {
    return NextResponse.json({ error: "Application is closed" }, { status: 409 });
  }

  const [{ data: profile }, { data: docs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", app.user_id).single(),
    supabase.from("documents").select("id, document_type, storage_path, file_name").eq("user_id", app.user_id).eq("status", "approved"),
  ]);
  if (!docs?.length) {
    return NextResponse.redirect(new URL(`/admin/applications/${id}?error=no-docs`, req.url), { status: 303 });
  }

  const files: Record<string, Uint8Array> = {};
  const used = new Set<string>();
  for (const d of docs) {
    const { data: blob, error } = await supabase.storage.from("student-documents").download(d.storage_path);
    if (error || !blob) continue;
    const ext = d.file_name.includes(".") ? d.file_name.slice(d.file_name.lastIndexOf(".")) : "";
    let name = `${docLabel(d.document_type).replace(/[^\w]+/g, "-")}${ext}`;
    for (let i = 2; used.has(name); i++) name = `${docLabel(d.document_type).replace(/[^\w]+/g, "-")}-${i}${ext}`;
    used.add(name);
    files[name] = new Uint8Array(await blob.arrayBuffer());
  }

  const summary = [
    `Applicant: ${profile?.full_name ?? ""}`,
    `Email: ${profile?.email ?? ""}`,
    `Nationality: ${countryName(profile?.nationality) ?? ""}${profile?.is_eu_eea ? " (EU/EEA)" : ""}`,
    `Education: ${EDUCATION_LEVELS.find((e) => e.value === profile?.education_level)?.label ?? ""}`,
    `English: ${profile?.english_test_type ?? ""} ${profile?.english_test_score ?? ""}`,
    `Programme: ${app.programmes?.title ?? ""}`,
    `Institution: ${app.institutions?.name ?? ""}`,
    `Consent to share given: ${app.share_consent_at}`,
    "",
    "Included documents:",
    ...Object.keys(files).map((f) => `- ${f}`),
  ].join("\n");
  files["applicant-summary.txt"] = strToU8(summary);

  const zip = zipSync(files, { level: 6 });

  // Log every shared document (visible to the student)
  await supabase.from("document_shares").insert(
    docs.map((d) => ({
      application_id: app.id,
      document_id: d.id,
      user_id: app.user_id,
      institution_id: app.institution_id,
      document_type: d.document_type,
      shared_by: user.id,
      method: "export",
    })),
  );

  const safe = (s: string) => s.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const filename = `${safe(profile?.full_name ?? "applicant")}-${safe(app.institutions?.name ?? "school")}.zip`;
  return new NextResponse(Buffer.from(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
