import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Coming soon",
  robots: { index: false, follow: false },
};

// Covers the normal header and footer so visitors only see this page before launch.
export default function ComingSoon() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-paper">
      <div className="grid min-h-full lg:grid-cols-2">
        <div className="flex flex-col justify-between px-6 py-8 sm:px-12 sm:py-12">
          <p className="flex items-center gap-3 font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
            <Image src="/images/northstep-mountain.png" alt="" width={1157} height={483} priority className="h-9 w-auto" />
            NorthStep
          </p>

          <div className="my-16 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sea">Launching soon</p>
            <h1 className="mt-4 text-5xl leading-[1.04] text-ink sm:text-6xl">
              Make a NorthStep. <span className="italic text-sea">Study abroad, without the guesswork.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              We’re building the simplest way for international students to find out where they can study abroad, and get
              help applying. Starting with Denmark. Opening very soon.
            </p>
            <div className="mt-10">
              <WaitlistForm />
            </div>
            <p className="mt-8 text-[15px] text-ink-soft">
              Questions in the meantime?{" "}
              <a className="font-medium text-sea underline underline-offset-4" href={`mailto:${site.contactEmail}`}>
                {site.contactEmail}
              </a>
            </p>
          </div>

          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {site.name} ·{" "}
            <Link href="/privacy" className="hover:text-ink">Privacy</Link> ·{" "}
            <Link href="/login" className="hover:text-ink">Team login</Link>
          </p>
        </div>

        <div className="relative hidden min-h-[320px] lg:block">
          <Image
            src="/images/hero-copenhagen.jpg"
            alt="A student cycling along the harbour in Nyhavn, Copenhagen"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
