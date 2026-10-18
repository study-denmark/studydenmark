import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { purgeUser } from "@/lib/purge-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_DOCS = 500;
const MAX_USERS = 50;

/**
 * Daily retention job (scheduled in vercel.json), as promised in the privacy policy:
 * documents 12 months after membership ends, inactive accounts after 24 months.
 * The database functions decide what is due, so running it more often only repeats the same policy.
 * If CRON_SECRET is set in Vercel, only Vercel Cron (which sends it as a Bearer token) may run it.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const errors: string[] = [];
  let documentsDeleted = 0;
  let usersDeleted = 0;

  // 1) Documents
  const { data: docs, error: docsErr } = await admin.rpc("retention_documents_due");
  if (docsErr) errors.push(`documents query: ${docsErr.message}`);
  const dueDocs = ((docs ?? []) as { id: string; storage_path: string }[]).slice(0, MAX_DOCS);
  for (let i = 0; i < dueDocs.length; i += 100) {
    const batch = dueDocs.slice(i, i + 100);
    const { error: rmErr } = await admin.storage.from("student-documents").remove(batch.map((d) => d.storage_path));
    if (rmErr) {
      errors.push(`storage remove: ${rmErr.message}`);
      continue; // keep the rows so the next run retries
    }
    const { error: delErr, count } = await admin
      .from("documents")
      .delete({ count: "exact" })
      .in("id", batch.map((d) => d.id));
    if (delErr) errors.push(`documents delete: ${delErr.message}`);
    else documentsDeleted += count ?? batch.length;
  }

  // 2) Inactive accounts
  const { data: users, error: usersErr } = await admin.rpc("retention_users_due");
  if (usersErr) errors.push(`users query: ${usersErr.message}`);
  for (const u of ((users ?? []) as { user_id: string }[]).slice(0, MAX_USERS)) {
    const res = await purgeUser(u.user_id);
    if (res.ok) usersDeleted++;
    else errors.push(`user ${u.user_id}: ${res.error}`);
  }

  // 3) Waitlist sign-ups older than 12 months
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const { error: wlErr } = await admin.from("waitlist").delete().lt("created_at", cutoff.toISOString());
  if (wlErr) errors.push(`waitlist delete: ${wlErr.message}`);

  await admin.from("retention_runs").insert({
    documents_deleted: documentsDeleted,
    users_deleted: usersDeleted,
    errors: errors.length ? errors.join("\n").slice(0, 4000) : null,
  });

  if (errors.length) console.error("[retention]", errors);
  return NextResponse.json({ documentsDeleted, usersDeleted, errors: errors.length });
}
