import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";

export default async function AdminHome() {
  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  const results = await Promise.all([
    supabase.from("institutions").select("*", head),
    supabase.from("institutions").select("*", head).eq("is_partner", true),
    supabase.from("programmes").select("*", head),
    supabase.from("programmes").select("*", head).eq("is_published", true),
    supabase.from("profiles").select("*", head).eq("role", "student"),
    supabase.from("profiles").select("*", head).eq("role", "student").not("onboarding_completed_at", "is", null),
    supabase.from("subscriptions").select("*", head).in("status", ["active", "trialing"]),
  ]);
  const [institutions, partners, programmes, published, students, onboarded, active] = results.map((r) => r.count ?? 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat k="Students" v={students} sub={`${onboarded} completed profile`} />
        <Stat k="Active memberships" v={active} />
        <Stat k="Programmes" v={programmes} sub={`${published} published`} href="/admin/programmes" />
        <Stat k="Institutions" v={institutions} sub={`${partners} partners`} href="/admin/institutions" />
      </div>
      <Card>
        <h2 className="text-lg font-semibold">Getting data in</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] text-ink-soft">
          <li><Link className="text-sea underline" href="/admin/institutions/new">Add an institution</Link> – tick “Partner” if you have a referral agreement.</li>
          <li><Link className="text-sea underline" href="/admin/programmes/new">Add its programmes</Link> – requirements, tuition, deadlines and source link.</li>
          <li>Tick “Published” to show it to members. Tick “Free preview” on 3–6 programmes to show them on the public site.</li>
        </ol>
      </Card>
    </div>
  );
}

function Stat({ k, v, sub, href }: { k: string; v: number; sub?: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted">{k}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold">{v}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </>
  );
  const cls = "block rounded-[var(--radius-card)] border border-line bg-surface p-5";
  return href ? <Link href={href} className={`${cls} hover:border-ink/30`}>{body}</Link> : <div className={cls}>{body}</div>;
}
