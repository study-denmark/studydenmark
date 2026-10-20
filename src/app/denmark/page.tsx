import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCountry } from "@/config/countries";
import { ButtonLink, Check, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Study in Denmark",
  description:
    "English-taught programmes in Denmark: entry requirements, deadlines, tuition and help with your application.",
};

const denmark = getCountry("denmark");

const faqs: [string, ReactNode][] = [
  [
    "Do I still need to apply through optagelse.dk?",
    "For most bachelor’s and AP programmes, yes. Optagelse.dk is the official application system, and we’ll guide you through it. Master’s programmes usually have their own application portals, so check each university.",
  ],
  [
    "When can I apply?",
    "For autumn 2027, optagelse.dk is open from 1 February to 15 March, 12:00 noon Danish time, for bachelor’s and AP programmes. Master’s deadlines vary by university.",
  ],
  [
    "Do EU and non-EU students apply differently?",
    <>
      The steps are similar, but the rules on tuition, fees and residence permits differ.{" "}
      <Link href="/denmark/guide/eu-vs-non-eu" className="text-sea underline underline-offset-4 hover:text-ink">
        Our free guide
      </Link>{" "}
      explains what applies to you.
    </>,
  ],
];

export default function DenmarkPage() {
  const guideCards = (denmark.guide ?? []).filter((g) => g.card);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-12 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Eyebrow>Study in Denmark</Eyebrow>
            <h1 className="text-[2.6rem] leading-[1.05] font-semibold sm:text-6xl">
              Study in Denmark, <span className="italic text-sea">without the guesswork.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Find out exactly what you can study in Denmark – and get help applying.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/denmark/eligibility" variant="accent">
                Check your eligibility – free
              </ButtonLink>
              <ButtonLink href="/denmark/guide/student-life" variant="ghost">
                How studying in Denmark works
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <li className="flex items-center gap-2"><Check /> Requirements from official Danish sources</li>
              <li className="flex items-center gap-2"><Check /> Secure payment via Stripe</li>
              <li className="flex items-center gap-2"><Check /> GDPR-compliant document storage</li>
            </ul>
          </div>

          {/* Visual: photo with a sample match card on top */}
          <div className="relative">
            <div className="relative ml-auto aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-sea-soft md:w-[86%]">
              <Image
                src="/images/hero-copenhagen.jpg"
                alt="A student cycling along the harbour in Nyhavn, Copenhagen"
                fill
                priority
                sizes="(min-width: 1024px) 460px, (min-width: 768px) 70vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative mx-4 -mt-16 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[0_30px_60px_-30px_rgba(20,33,61,0.35)] md:absolute md:-top-6 md:left-0 md:mx-0 md:mt-0 md:w-[328px]">
              <p className="text-[11px] text-muted">Example: high school + IELTS 6.5</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink">You can apply for</p>
              <ul className="mt-2.5 space-y-1.5">
                {denmark.programmeTypes?.map((t) => (
                  <li key={t.name} className="rounded-md bg-paper px-2.5 py-1.5 text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-muted">{t.duration}</span>
                    </div>
                    {t.note && <p className="mt-0.5 text-[11px] leading-snug text-muted">{t.note}</p>}
                  </li>
                ))}
              </ul>
              {denmark.applicationPeriod && (
                <>
                  <p className="mt-2.5 w-full whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-center text-[12px] text-white sm:text-[13px]">
                    <span className="font-semibold">Apply:</span> {denmark.applicationPeriod.label}
                  </p>
                  <p className="mt-1.5 text-center text-[11px] text-muted">{denmark.applicationPeriod.note}</p>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Problem */}
      <section className="border-y border-line bg-surface">
        <Container className="grid gap-10 py-16 md:grid-cols-3">
          <div className="md:col-span-1">
            <h2 className="text-3xl font-semibold leading-tight">The information exists. It’s just everywhere.</h2>
          </div>
          <div className="grid gap-6 text-ink-soft sm:grid-cols-2 md:col-span-2">
            <p>
              Every school has its own website, its own requirements and its own deadlines. Rules differ for
              EU and non-EU students. Some programmes are free, others cost thousands of euros a year.
            </p>
            <p>
              We collect it, check it against official Danish sources and show you only what applies to
              <em> you</em> – then help you put your application together.
            </p>
          </div>
        </Container>
      </section>

      {/* Guide links */}
      <section>
        <Container className="py-20">
          <Eyebrow>Free guide</Eyebrow>
          <h2 className="text-3xl font-semibold sm:text-4xl">Start with the basics</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {guideCards.map(({ href, card }) => (
              <Link key={href} href={href} className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-colors hover:border-ink/30">
                <div className="relative aspect-[4/3] bg-sea-soft">
                  <Image src={card!.image} alt="" fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{card!.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{card!.body}</p>
                  <p className="mt-4 text-sm font-medium text-sea group-hover:text-ink">Read →</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-line">
        <Container className="py-20">
          <div className="max-w-3xl">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="text-3xl font-semibold sm:text-4xl">Questions about Denmark</h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {faqs.map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium">
                    {q}
                    <span className="mt-1 text-muted transition-transform group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-soft">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
