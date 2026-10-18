"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { purgeUser } from "@/lib/purge-user";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");
  return { supabase, me: user };
}

const s = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};

// ---------- Members ----------
export async function setMemberRole(f: FormData) {
  const { supabase, me } = await requireAdmin();
  const id = s(f, "id");
  const role = s(f, "role");
  if (!id || (role !== "admin" && role !== "student")) return;
  if (id === me.id && role !== "admin") redirect(`/admin/members/${id}?error=self`);
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteMember(f: FormData) {
  const { me } = await requireAdmin();
  const id = s(f, "id");
  if (!id) return;
  if (id === me.id) redirect(`/admin/members/${id}?error=self`);
  if (s(f, "confirm") !== "DELETE") redirect(`/admin/members/${id}?error=confirm`);
  const res = await purgeUser(id);
  if (!res.ok) redirect(`/admin/members/${id}?error=delete`);
  revalidatePath("/admin", "layout");
  redirect("/admin/members?deleted=1");
}

/** Give a member Basic or Premium for 12 months without Stripe (e.g. paid by bank transfer, or free). */
export async function grantMembership(f: FormData) {
  await requireAdmin();
  const id = s(f, "id");
  const plan = s(f, "plan");
  if (!id || (plan !== "basic" && plan !== "premium")) return;
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);
  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").insert({
    user_id: id,
    stripe_subscription_id: `manual_${crypto.randomUUID()}`,
    stripe_customer_id: "manual",
    plan,
    status: "active",
    current_period_start: now.toISOString(),
    current_period_end: end.toISOString(),
    cancel_at_period_end: true,
  });
  if (error) {
    console.error("[admin] grant membership failed", error);
    redirect(`/admin/members/${id}?error=grant`);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/members/${id}?granted=${plan}`);
}

/** End a manually granted membership right away. Stripe memberships are cancelled in Stripe instead. */
export async function endManualMembership(f: FormData) {
  await requireAdmin();
  const id = s(f, "id");
  const subId = s(f, "subscription_id");
  if (!id || !subId?.startsWith("manual_")) return;
  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .update({ status: "canceled", current_period_end: new Date().toISOString() })
    .eq("stripe_subscription_id", subId)
    .eq("user_id", id);
  revalidatePath("/admin", "layout");
  redirect(`/admin/members/${id}`);
}

// ---------- Document review ----------
export async function reviewDocument(f: FormData) {
  const { supabase, me } = await requireAdmin();
  const id = s(f, "id");
  const decision = s(f, "decision");
  const comment = s(f, "comment");
  if (!id || (decision !== "approved" && decision !== "rejected" && decision !== "uploaded")) return;
  if (decision === "rejected" && !comment) {
    const back = s(f, "back") ?? "/admin/documents";
    redirect(`${back}${back.includes("?") ? "&" : "?"}error=comment`);
  }
  await supabase
    .from("documents")
    .update({
      status: decision,
      reviewer_comment: decision === "rejected" ? comment : null,
      reviewed_by: decision === "uploaded" ? null : me.id,
      reviewed_at: decision === "uploaded" ? null : new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

// ---------- Applications ----------
const STAGES = ["interested", "documents_complete", "sent_to_school", "admitted", "started", "rejected", "withdrawn"];

export async function updateApplication(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(f, "id");
  if (!id) return;

  const stage = s(f, "stage");
  const { data: current } = await supabase
    .from("applications")
    .select("stage, institution_id, sent_to_school_at, admitted_at, started_at")
    .eq("id", id)
    .single();
  if (!current) return;

  if (stage && STAGES.includes(stage) && stage !== current.stage) {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { stage };
    if (stage === "sent_to_school" && !current.sent_to_school_at) patch.sent_to_school_at = now;
    if (stage === "admitted" && !current.admitted_at) patch.admitted_at = now;
    if (stage === "started" && !current.started_at) patch.started_at = now;
    await supabase.from("applications").update(patch).eq("id", id);
  }

  // Commercial side (admin-only table)
  const { data: existing } = await supabase.from("application_admin").select("*").eq("application_id", id).maybeSingle();
  let amount = f.has("commission_amount_eur")
    ? s(f, "commission_amount_eur") == null
      ? null
      : Number(s(f, "commission_amount_eur"))
    : (existing?.commission_amount_eur ?? null);
  let status = s(f, "commission_status") ?? existing?.commission_status ?? "none";

  // When a student is admitted/starts at a partner school, expect commission automatically
  if ((stage === "admitted" || stage === "started") && status === "none") {
    const { data: deal } = await supabase
      .from("partner_agreements")
      .select("commission_amount_eur")
      .eq("institution_id", current.institution_id)
      .maybeSingle();
    if (deal) {
      status = "expected";
      amount = amount ?? deal.commission_amount_eur;
    }
  }

  const now = new Date().toISOString();
  await supabase.from("application_admin").upsert(
    {
      application_id: id,
      commission_amount_eur: amount,
      commission_status: status,
      commission_invoiced_at:
        status === "invoiced" || status === "paid" ? (existing?.commission_invoiced_at ?? now) : existing?.commission_invoiced_at ?? null,
      commission_paid_at: status === "paid" ? (existing?.commission_paid_at ?? now) : null,
      internal_notes: f.has("internal_notes") ? s(f, "internal_notes") : (existing?.internal_notes ?? null),
    },
    { onConflict: "application_id" },
  );

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

// ---------- Partner agreements ----------
export async function savePartnerAgreement(f: FormData) {
  const { supabase } = await requireAdmin();
  const institutionId = s(f, "institution_id");
  const amount = s(f, "commission_amount_eur");
  if (!institutionId) return;
  if (amount == null) {
    await supabase.from("partner_agreements").delete().eq("institution_id", institutionId);
  } else {
    await supabase.from("partner_agreements").upsert(
      {
        institution_id: institutionId,
        commission_amount_eur: Number(amount),
        payment_terms: s(f, "payment_terms"),
        contact_name: s(f, "contact_name"),
        contact_email: s(f, "contact_email"),
        agreement_signed_at: s(f, "agreement_signed_at"),
        notes: s(f, "notes"),
      },
      { onConflict: "institution_id" },
    );
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/institutions/${institutionId}?saved=agreement`);
}
