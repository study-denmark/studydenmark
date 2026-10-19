import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { ButtonLink, Card, Check, Container, Eyebrow } from "@/components/ui";
import { HeroSide } from "@/components/hero-side";

const steps = [
  {
    n: "1",
    title: "Tell us about yourself",
    body: "Share your education, citizenship and English level. It takes about three minutes, and you don’t need an account.",
  },
  {
    n: "2",
    title: "See where you can apply",
    body: "We show the English-taught programmes you qualify for, with requirements, tuition and deadlines in one place.",
  },
  {
    n: "3",
    title: "Prepare your application",
    body: "Get a checklist of the documents you need. With Premium, we check your documents and help you apply.",
  },
];
// Desktop: each step sits higher than the one before, like the staircase in the logo
const stepOffset = ["md:mt-20", "md:mt-10", "md:mt-0"];

const plans = [
  { name: "Free", price: "€0", interval: null, body: "Country guides, key deadlines and an eligibility check. No account needed." },
  {
    name: site.plans.basic.name,
    price: site.plans.basic.amountLabel,
    interval: site.plans.basic.interval,
    body: "See every programme you can study and exactly what it requires.",
  },
  {
    name: site.plans.premium.name,
    price: site.plans.premium.amountLabel,
    interval: site.plans.premium.interval,
    body: "We check your documents and help you submit your applications, including to our partner schools.",
  },
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
              Make a NorthStep.
              <br />
              <span className="italic text-sea">Study abroad, without the guesswork.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{site.tagline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#countries" variant="accent">
                Choose your country
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="ghost">
                How it works
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <li className="flex items-center gap-2"><Check /> Requirements from official sources</li>
              <li className="flex items-center gap-2"><Check /> Secure payment via Stripe</li>
              <li className="flex items-center gap-2"><Check /> GDPR-compliant document storage</li>
            </ul>
          </div>

          <HeroSide />
        </Container>
      </section>

      {/* Photo band */}
      <section aria-hidden="true" className="relative h-[240px] sm:h-[340px] lg:h-[420px]">
        <Image
          src="/images/library-band.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_62%]"
        />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24">
        <Container className="py-20">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">Your application, one step at a time</h2>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-5">
            {/* Thin stepped line joining the three number circles (desktop) */}
            <svg
              aria-hidden
              viewBox="0 0 600 80"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-20 w-full md:block"
            >
              <path d="M100 80 H200 V40 H400 V0 H500" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="text-ink/25" />
            </svg>
            {steps.map((s, i) => (
              <li key={s.n} className={`relative ${stepOffset[i]}`}>
                {/* Vertical connector between stacked cards (mobile) */}
                {i < steps.length - 1 && (
                  <span aria-hidden className="absolute left-1/2 top-full h-10 w-px bg-ink/25 md:hidden" />
                )}
                <span className="absolute left-1/2 top-0 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink bg-surface text-sm font-semibold text-ink">
                  {s.n}
                </span>
                <Card className="h-full pt-9 text-center">
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-ink-soft">{s.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Plans */}
      <section className="bg-ink text-white">
        <Container className="py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Plans</p>
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">Start free. Get more help when you need it.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <Link
                key={p.name}
                href="/pricing"
                className="group flex flex-col rounded-[var(--radius-card)] border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/30"
              >
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold">
                  {p.price}
                  {p.interval && <span className="ml-1 font-sans text-base font-normal text-white/60">/{p.interval}</span>}
                </p>
                <p className="mt-3 text-[15px] text-white/75">{p.body}</p>
                <p className="mt-auto pt-6 text-sm font-medium text-white/80 group-hover:text-white">Compare plans →</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Our story – TODO: replace the placeholder text with the founders' story */}
      <section>
        <Container className="grid gap-10 py-20 md:grid-cols-3">
          <div className="md:col-span-1">
            <Eyebrow>Our story</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight">Why we started NorthStep</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft md:col-span-2">
            <p>[Placeholder – who the founders are and where they come from. Two or three sentences.]</p>
            <p>[Placeholder – the moment you realised studying abroad was harder than it should be.]</p>
            <p>[Placeholder – what NorthStep does differently, and the promise you make to students.]</p>
            <p className="text-base text-muted">— [Founder names]</p>
          </div>
        </Container>
      </section>
    </>
  );
}
