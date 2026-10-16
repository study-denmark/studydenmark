"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { purgeUser } from "@/lib/purge-user";

// GDPR art. 17: delete account, files and personal data.
// Payment records stay (bookkeeping law) but are detached from the person.
export async function deleteAccount(formData: FormData) {
  if (formData.get("confirm") !== "DELETE") {
    redirect("/account?error=confirm");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const res = await purgeUser(user.id);
  if (!res.ok) redirect("/account?error=delete");

  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
