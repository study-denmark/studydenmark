import type { Metadata } from "next";
import { site } from "@/config/site";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "FAQ" };

const faqs: [string, string][] = [
  [
    "What’s the difference between Basic and Premium?",
    `Basic (${site.plans.basic.amountLabel}/${site.plans.basic.interval}) gives you the full programme database, your personal matches and the requirements for each programme. Premium (${site.plans.premium.amountLabel}/${site.plans.premium.interval}) adds our help applying: a document checklist, secure upload, a check of every document and an application sent to the schools you choose. You can upgrade from Basic any time and only pay the difference.`,
  ],
  [
    "Isn’t this information available for free?",
    "Most of it is – spread across dozens of school websites and government pages, with rules that differ by citizenship and education. We bring it together, keep it up to date and match it to your profile, so you only see what applies to you. Our free guide covers the basics.",
  ],
  [
    "Are you an official Danish authority?",
    "No. We are an independent company. We base our information on official sources such as studyindenmark.dk, optagelse.dk and nyidanmark.dk, and link to them so you can check.",
  ],
  [
    "Do you guarantee admission?",
    "No one can. Schools make admission decisions themselves. We help you find programmes you meet the requirements for and submit a complete, well-prepared application.",
  ],
  [
    "What does “Partner” mean?",
    "Some schools pay us a referral fee when a student we helped enrols. We always label them “Partner”. It never changes the requirements we show or the price you pay, and we show all programmes you qualify for.",
  ],
  [
    "What happens to my documents?",
    "They are stored encrypted in a private storage area that only you and our review team can access. We only share them with a school after you have explicitly asked us to apply there on your behalf – and you can see a log of every share in your account.",
  ],
  [
    "Can I delete my data?",
    "Yes. You can download all your data or delete your account and every uploaded file from your account page at any time.",
  ],
  [
    "How do I cancel?",
    "From your account page. Your membership stays active until the end of the period you’ve paid for, and it won’t renew.",
  ],
  [
    "Do I still need to apply through optagelse.dk?",
    "For bachelor-level programmes, yes – that’s the official system. We help you prepare everything and guide you through it. Master’s programmes usually have their own university portals.",
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
              <p className="mt-3 leading-relaxed text-ink-soft">{a}</p>
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
