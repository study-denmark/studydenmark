import { requireSubscriber } from "@/lib/auth";
import { Container } from "@/components/ui";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSubscriber();
  return (
    <Container className="py-8 sm:py-10">
      <DashboardNav isAdmin={profile?.role === "admin"} />
      <div className="pt-8 sm:pt-10">{children}</div>
    </Container>
  );
}
