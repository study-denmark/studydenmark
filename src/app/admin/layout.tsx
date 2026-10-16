import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Container } from "@/components/ui";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSession();
  if (!user) redirect("/login?next=/admin");
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-4">
        <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">Admin</span>
        <nav className="flex gap-5 text-[15px] text-ink-soft">
          <Link href="/admin" className="hover:text-ink">Overview</Link>
          <Link href="/admin/institutions" className="hover:text-ink">Institutions</Link>
          <Link href="/admin/programmes" className="hover:text-ink">Programmes</Link>
          <Link href="/dashboard" className="hover:text-ink">← Student view</Link>
        </nav>
      </div>
      <div className="pt-8">{children}</div>
    </Container>
  );
}
