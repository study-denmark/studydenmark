import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Opens a private document via a 60-second signed URL.
// RLS ensures students only reach their own files; admins can reach all.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: doc } = await supabase.from("documents").select("storage_path, file_name").eq("id", id).maybeSingle();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase.storage.from("student-documents").createSignedUrl(doc.storage_path, 60);
  if (error || !data) return NextResponse.json({ error: "Could not open file" }, { status: 500 });

  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "no-store" } });
}
