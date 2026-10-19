import type { Metadata } from "next";
import { site } from "@/config/site";
import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui";
import { PLANS, planFeatures } from "@/lib/plans";

export const metadata: Metadata = { title: "FAQ" };

const faqs: [string, ReactNode][] = [
  [
    "What is NorthStep?",
    "NorthStep helps international students apply to study abroad. Tell us about your education and we’ll show you the programmes you can apply for, what each one asks for, and when to apply. We’re starting with Denmark, and more countries are on the way.",
  ],
  [
    "What’s the difference between Basic and Premium?",
    <div key="plans" className="space-y-6">
      {PLANS.map((p) => (
        <div key={p}>
          <p className="text-[15px] font-semibold text-ink">
            {site.plans[p].name} · {site.plans[p].amountLabel}/{site.plans[p].interval}
          </p>
          <ul className="mt-2.5 space-y-2">
            {planFeatures[p].map((f) => (
              <li key={f} className="flex gap-3">
                <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p>You can upgrade from Basic any time and only pay the difference.</p>
    </div>,
  ],
  [
    "Isn’t this information free online?",
    "Some of it is. But it’s scattered across many websites, and the rules change depending on your citizenship and your education. We bring it together and match it to you, so you only see what applies. Our free guide is a good place to start.",
  ],
  [
    "Are you an official authority?",
    "No, we’re an independent team. Everything we share comes from official sources, and we link to them so you can always check for yourself.",
  ],
  [
    "Can you guarantee admission?",
    "No. Admission decisions are made by the schools. What we do is help you find programmes you qualify for and put together a complete, well-organised application.",
  ],
  [
    "What does “Partner” mean?",
    "We work with selected schools and mark them with a “Partner” label. A partnership never changes the requirements we show or the price you pay.",
  ],
  [
    "What happens to my documents?",
    "Your documents are stored in a private, secure space that only you and our team can open. We only send a document to a school when you ask us to apply there, and you can see every transfer in your account.",
  ],
  [
    "Can I delete my data?",
    "Yes, whenever you like. From your account page you can download your data or delete your account and every file you’ve uploaded.",
  ],
  [
    "How do I cancel?",
    "From your account page. Your plan stays active until the end of the period you’ve paid for, and it won’t renew.",
  ],
];

export default function FaqPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Eyebrow>FAQ</Eyebrow>
        <h1 className="text-4xl font-semibold sm:text-5xl">Questions, answered</h1>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium">
                {q}
                <span className="mt-1 text-muted transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              {typeof a === "string" ? (
                <p className="mt-3 leading-relaxed text-ink-soft">{a}</p>
              ) : (
                <div className="mt-4 leading-relaxed text-ink-soft">{a}</div>
              )}
            </details>
          ))}
        </div>
        <p className="mt-10 text-ink-soft">
          Something else? Email us at{" "}
          <a className="text-sea underline underline-offset-4" href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
