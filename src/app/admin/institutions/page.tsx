import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink, PartnerBadge } from "@/components/ui";

const typeLabels: Record<string, string> = {
  business_academy: "Business academy",
  university_college: "University college",
  university: "University",
  private_school: "Private school",
  other: "Other",
};

export default async function InstitutionsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("institutions")
    .select("id, name, type, city, is_partner, programmes(count)")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Institutions</h1>
        <ButtonLink href="/admin/institutions/new">Add institution</ButtonLink>
      </div>
      <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
        <table className="w-full min-w-[560px] text-left text-[15px]">
          <thead className="bg-paper text-sm text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Programmes</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((i) => (
              <tr key={i.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/admin/institutions/${i.id}`} className="font-medium hover:text-sea">{i.name}</Link>{" "}
                  {i.is_partner && <PartnerBadge />}
                </td>
                <td className="px-4 py-3 text-ink-soft">{typeLabels[i.type] ?? i.type}</td>
                <td className="px-4 py-3 text-ink-soft">{i.city ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{(i.programmes as unknown as { count: number }[])?.[0]?.count ?? 0}</td>
              </tr>
            ))}
            {!data?.length && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted">No institutions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
