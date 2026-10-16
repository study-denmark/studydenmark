import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

/**
 * Permanently deletes a user: cancels Stripe, removes files, deletes the auth user
 * (cascades to profile, documents, applications, consents). Payments are kept but detached.
 */
export async function purgeUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();

  const { data: subs } = await admin.from("subscriptions").select("stripe_subscription_id, status").eq("user_id", userId);
  for (const s of subs ?? []) {
    if (!["canceled", "incomplete_expired"].includes(s.status) && !s.stripe_subscription_id.startsWith("zz-")) {
      try {
        await stripe().subscriptions.cancel(s.stripe_subscription_id);
      } catch (e) {
        console.error("[purge] stripe cancel failed", e);
      }
    }
  }

  const { data: files } = await admin.from("documents").select("storage_path").eq("user_id", userId);
  const paths = (files ?? []).map((f) => f.storage_path as string);
  for (let i = 0; i < paths.length; i += 100) {
    await admin.storage.from("student-documents").remove(paths.slice(i, i + 100));
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("[purge] delete failed", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
