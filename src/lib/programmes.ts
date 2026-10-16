import "server-only";
import { requireSubscriber } from "@/lib/auth";
import { PROGRAMME_SELECT, type ProgrammeWithInstitution, type StudentProfile } from "@/lib/types";

/** Everything a student page needs: profile, all published programmes, saved ids. */
export async function getStudentContext() {
  const { supabase, user, profile } = await requireSubscriber();
  const [{ data: programmes }, { data: saved }] = await Promise.all([
    supabase
      .from("programmes")
      .select(PROGRAMME_SELECT)
      .eq("is_published", true)
      .order("title")
      .returns<ProgrammeWithInstitution[]>(),
    supabase.from("saved_programmes").select("programme_id").eq("user_id", user!.id),
  ]);
  return {
    supabase,
    profile: profile as StudentProfile,
    programmes: programmes ?? [],
    savedIds: new Set((saved ?? []).map((s) => s.programme_id as string)),
  };
}
