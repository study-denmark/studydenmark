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
        <nav className="-mx-4 flex gap-5 overflow-x-auto px-4 text-[15px] whitespace-nowrap text-ink-soft sm:mx-0 sm:px-0">
          <Link href="/admin" className="hover:text-ink">Overview</Link>
          <Link href="/admin/members" className="hover:text-ink">Members</Link>
          <Link href="/admin/documents" className="hover:text-ink">Documents</Link>
          <Link href="/admin/applications" className="hover:text-ink">Applications</Link>
          <Link href="/admin/institutions" className="hover:text-ink">Institutions</Link>
          <Link href="/admin/programmes" className="hover:text-ink">Programmes</Link>
          <Link href="/admin/waitlist" className="hover:text-ink">Waitlist</Link>
          <Link href="/dashboard" className="hover:text-ink">← Student view</Link>
        </nav>
      </div>
      <div className="pt-8">{children}</div>
    </Container>
  );
}
