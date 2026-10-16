import Link from "next/link";
import { publicNav, site } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui";
import { MobileMenu } from "@/components/mobile-menu";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="7" fill="#C8102E" />
        <rect x="9" y="0" width="4" height="28" fill="#fff" />
        <rect x="0" y="12" width="28" height="4" fill="#fff" />
      </svg>
      <span className="font-[family-name:var(--font-display)] text-[19px] font-semibold tracking-tight text-ink">
        {site.shortName}
        <span className="text-muted font-normal"> Guide</span>
      </span>
    </Link>
  );
}

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-[15px] text-ink-soft lg:flex">
          {publicNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link href="/account" className="text-[15px] text-ink-soft hover:text-ink">
                Account
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full bg-ink px-4 py-2 text-[15px] font-medium text-white hover:bg-ink-soft"
              >
                My dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[15px] text-ink-soft hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-ink px-4 py-2 text-[15px] font-medium text-white hover:bg-ink-soft"
              >
                Get started
              </Link>
            </>
          )}
        </div>
        <MobileMenu signedIn={!!user} />
      </Container>
    </header>
  );
}
