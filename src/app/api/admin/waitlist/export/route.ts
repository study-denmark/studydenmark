import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data } = await supabase.from("waitlist").select("email, created_at").order("created_at");
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = ["email,signed_up_at", ...(data ?? []).map((r) => `${esc(r.email)},${esc(r.created_at)}`)].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="study-denmark-waitlist.csv"',
      "Cache-Control": "no-store",
    },
  });
}
