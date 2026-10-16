"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleSaved(formData: FormData) {
  const programmeId = String(formData.get("programme_id") ?? "");
  const saved = formData.get("saved") === "1";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !programmeId) return;

  if (saved) {
    await supabase.from("saved_programmes").delete().eq("user_id", user.id).eq("programme_id", programmeId);
  } else {
    await supabase.from("saved_programmes").insert({ user_id: user.id, programme_id: programmeId });
  }
  revalidatePath("/dashboard", "layout");
}
