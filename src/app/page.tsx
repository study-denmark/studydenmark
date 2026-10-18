import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { ButtonLink, Card, Container, Eyebrow } from "@/components/ui";

const steps = [
  {
    n: "01",
    title: "Tell us about you",
    body: "Your nationality, education, English level and budget. Takes about three minutes.",
  },
  {
    n: "02",
    title: "See what you can apply for",
    body: "English-taught programmes you actually qualify for, with requirements, deadlines and tuition in one place.",
  },
  {
    n: "03",
    title: "Get your documents ready",
    body: "A checklist for your chosen programmes. Upload once, we check them and help you apply.",
  },
];

const included = [
  "Personal match against English-taught programmes at business academies and universities",
  "Entry requirements explained for your education level and country",
  "Tuition, deadlines and language requirements side by side",
  "Premium: document checklist, secure upload and document check",
  "Premium: help submitting your application to partner schools",
  "Updates when deadlines are coming up",
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-12 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Eyebrow>For international students</Eyebrow>
            <h1 className="text-[2.6rem] leading-[1.05] font-semibold sm:text-6xl">
              Study in Denmark, <span className="italic text-sea">without the guesswork.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{site.tagline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/eligibility" variant="accent">
                Check your eligibility – free
              </ButtonLink>
              <ButtonLink href="/study-in-denmark" variant="ghost">
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
            <div className="relative ml-auto aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-sea-soft md:w-[84%]">
              <Image
                src="/images/hero-copenhagen.jpg"
                alt="A student cycling along the harbour in Nyhavn, Copenhagen"
                fill
                priority
                sizes="(min-width: 1024px) 460px, (min-width: 768px) 70vw, 100vw"
                className="object-cover"
              />
            </div>
            <Card className="relative mx-4 -mt-16 shadow-[0_30px_60px_-30px_rgba(20,33,61,0.35)] md:absolute md:left-0 md:top-[24%] md:mx-0 md:mt-0 md:w-[300px]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">With IELTS 6.5 and a high school diploma, you can apply for</p>
              <ul className="mt-3 space-y-2">
                {[
                  ["AP degrees", "2 years"],
                  ["Professional bachelor", "3.5 years"],
                  ["University bachelor", "3 years"],
                ].map(([t, d]) => (
                  <li key={t} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-sm">
                    <span className="font-medium">{t}</span>
                    <span className="text-muted">{d}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                <span className="font-semibold text-accent">Deadline:</span> 15 March, 12:00 (Danish time)
              </p>
            </Card>
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

      {/* How it works */}
      <section>
        <Container className="py-20">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">From “is this possible?” to submitted application</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <Card key={s.n}>
                <p className="font-[family-name:var(--font-display)] text-3xl text-accent">{s.n}</p>
                <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* What's included + price */}
      <section className="bg-ink text-white">
        <Container className="grid gap-12 py-20 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Two yearly memberships</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Find your programme – or let us help you apply.</h2>
            <p className="mt-5 max-w-md text-white/75">
              <strong className="text-white">Basic</strong> {site.plans.basic.amountLabel}/{site.plans.basic.interval}: see every
              programme you can study and what it requires. <strong className="text-white">Premium</strong>{" "}
              {site.plans.premium.amountLabel}/{site.plans.premium.interval}: we check your documents and help you apply. Cancel any time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 font-medium text-ink hover:bg-paper">
                Create your account
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 font-medium text-white hover:border-white/60">
                Compare plans
              </Link>
            </div>
          </div>
          <ul className="grid gap-3 self-center">
            {included.map((i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px]">
                <Check light /> {i}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Guide links */}
      <section>
        <Container className="py-20">
          <Eyebrow>Free guide</Eyebrow>
          <h2 className="text-3xl font-semibold sm:text-4xl">Start with the basics</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["/eu-vs-non-eu", "EU/EEA vs. non-EU", "Who pays tuition, and who needs a residence permit."],
              ["/admission-requirements", "Admission requirements", "What your diploma and English score need to show."],
              ["/deadlines", "Deadlines", "The key dates for September and February intake."],
              ["/cost-of-living", "Cost of living", "Rent, food, transport and what you can earn."],
            ].map(([href, title, body]) => (
              <Link key={href} href={href} className="group rounded-[var(--radius-card)] border border-line bg-surface p-6 transition-colors hover:border-ink/30">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{body}</p>
                <p className="mt-4 text-sm font-medium text-sea group-hover:text-ink">Read →</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function Check({ light = false }: { light?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={light ? "rgba(255,255,255,0.15)" : "#E6EFEE"} />
      <path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke={light ? "#fff" : "#2F5D62"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
