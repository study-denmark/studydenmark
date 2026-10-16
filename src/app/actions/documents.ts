"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !id) return;

  // RLS guarantees this only returns the user's own document
  const { data: doc } = await supabase
    .from("documents")
    .select("id, storage_path, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!doc || doc.status === "approved") return; // approved docs are locked

  await supabase.storage.from("student-documents").remove([doc.storage_path]);
  await supabase.from("documents").delete().eq("id", doc.id);
  revalidatePath("/dashboard", "layout");
}
