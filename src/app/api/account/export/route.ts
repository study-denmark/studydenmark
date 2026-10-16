import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GDPR art. 15/20: let the user download everything we hold about them.
// Uses the user's own session, so RLS guarantees only their rows are returned.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const tables = [
    "profiles",
    "consents",
    "subscriptions",
    "payments",
    "saved_programmes",
    "documents",
    "applications",
    "document_shares",
  ] as const;

  const result: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email, created_at: user.created_at },
  };

  for (const table of tables) {
    const { data } = await supabase.from(table).select("*");
    result[table] = data ?? [];
  }

  return new NextResponse(JSON.stringify(result, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="my-data-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
