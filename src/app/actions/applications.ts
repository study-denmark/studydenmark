"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SHARE_CONSENT_VERSION } from "@/lib/documents";

export type ApplyState = { error: string | null };

export async function applyViaUs(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const programmeId = String(formData.get("programme_id") ?? "");
  if (formData.get("consent") !== "on") {
    return { error: "Please tick the box to give us permission to share your documents with this school." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: programme } = await supabase
    .from("programmes")
    .select("id, slug, institution_id, is_published")
    .eq("id", programmeId)
    .maybeSingle();
  if (!programme?.is_published) return { error: "This programme isn’t available right now." };

  const now = new Date().toISOString();
  const { data: app, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      programme_id: programme.id,
      institution_id: programme.institution_id,
      stage: "interested",
      share_consent_at: now,
      share_consent_version: SHARE_CONSENT_VERSION,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") redirect("/dashboard/applications");
    console.error("[apply]", error);
    return { error: "We couldn’t register your request. Please try again." };
  }

  const ua = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
  await supabase.from("consents").insert({
    user_id: user.id,
    consent_type: "share_with_institution",
    version: SHARE_CONSENT_VERSION,
    institution_id: programme.institution_id,
    application_id: app.id,
    granted_at: now,
    user_agent: ua,
  });

  // Keep it on the shortlist too
  await supabase.from("saved_programmes").upsert(
    { user_id: user.id, programme_id: programme.id },
    { onConflict: "user_id,programme_id", ignoreDuplicates: true },
  );

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/applications?new=1");
}
