import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { levelLabels } from "@/lib/labels";
import type { ProgrammeWithInstitution } from "@/lib/types";
import { ButtonLink, PartnerBadge } from "@/components/ui";

export default async function ProgrammesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programmes")
    .select("id, slug, title, level, city, is_published, is_public_preview, last_verified_at, institutions(name, is_partner)")
    .order("title")
    .returns<(Pick<ProgrammeWithInstitution, "id" | "slug" | "title" | "level" | "city" | "is_published" | "is_public_preview" | "last_verified_at"> & { institutions: { name: string; is_partner: boolean } | null })[]>();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Programmes</h1>
        <ButtonLink href="/admin/programmes/new">Add programme</ButtonLink>
      </div>
      <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-[15px]">
          <thead className="bg-paper text-sm text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Programme</th>
              <th className="px-4 py-3 font-medium">Institution</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Checked</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/admin/programmes/${p.id}`} className="font-medium hover:text-sea">{p.title}</Link>
                  <p className="text-xs text-muted">{p.city}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {p.institutions?.name} {p.institutions?.is_partner && <PartnerBadge />}
                </td>
                <td className="px-4 py-3 text-ink-soft">{levelLabels[p.level]}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.is_published ? "bg-sea-soft text-sea" : "bg-paper text-muted"}`}>
                    {p.is_published ? "Published" : "Draft"}
                  </span>
                  {p.is_public_preview && <span className="ml-1.5 text-xs text-muted">· free preview</span>}
                </td>
                <td className="px-4 py-3 text-sm text-ink-soft">
                  {p.last_verified_at ? new Date(p.last_verified_at).toLocaleDateString("en-GB") : "—"}
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No programmes yet. Add an institution first.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
