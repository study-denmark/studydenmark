"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

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

  const admin = createAdminClient();

  // 1. Cancel any live Stripe subscription
  const { data: subs } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("user_id", user.id);
  for (const s of subs ?? []) {
    if (!["canceled", "incomplete_expired"].includes(s.status)) {
      try {
        await stripe().subscriptions.cancel(s.stripe_subscription_id);
      } catch (e) {
        console.error("[account] cancel failed", e);
      }
    }
  }

  // 2. Delete uploaded files
  const { data: files } = await admin.storage.from("student-documents").list(user.id, {
    limit: 1000,
  });
  if (files?.length) {
    await admin.storage
      .from("student-documents")
      .remove(files.map((f) => `${user.id}/${f.name}`));
  }

  // 3. Delete the auth user — cascades to profile, documents, applications, consents
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[account] delete failed", error);
    redirect("/account?error=delete");
  }

  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
