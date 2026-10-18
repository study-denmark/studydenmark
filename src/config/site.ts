// Central config. Change the brand name, price text and contact here.
export const site = {
  name: "StudyDenmark Guide",
  shortName: "StudyDenmark",
  tagline: "Find out exactly what you can study in Denmark – and get help applying.",
  description:
    "Personal guidance for international students: entry requirements, English-taught programmes, deadlines and help collecting your application documents.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "hello@example.com",
  // Display only. The real prices come from the Stripe price IDs in .env
  plans: {
    basic: { name: "Basic", amountLabel: "DKK 100", approxEur: "≈ €13", interval: "year" },
    premium: { name: "Premium", amountLabel: "DKK 500", approxEur: "≈ €67", interval: "year" },
  },
  // Cheapest plan, used in "from DKK 100" texts
  price: { amountLabel: "DKK 100", approxEur: "≈ €13", interval: "year" },
  // Bump this when Terms / Privacy text changes. Stored with every consent.
  consentVersion: "v1-2026-10",
} as const;

export const officialSources = {
  studyInDenmark: "https://studyindenmark.dk",
  optagelse: "https://www.optagelse.dk",
  nyIDanmark: "https://www.nyidanmark.dk/en-GB",
  ufm: "https://ufm.dk/en",
  ics: "https://www.icitizen.dk",
  ug: "https://www.ug.dk",
} as const;

export const publicNav = [
  { href: "/study-in-denmark", label: "Studying in Denmark" },
  { href: "/programmes", label: "Programmes" },
  { href: "/eligibility", label: "Check eligibility" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

export const guideNav = [
  { href: "/study-in-denmark", label: "Student life" },
  { href: "/eu-vs-non-eu", label: "EU/EEA vs. non-EU" },
  { href: "/admission-requirements", label: "Admission requirements" },
  { href: "/deadlines", label: "Deadlines" },
  { href: "/cost-of-living", label: "Cost of living" },
] as const;
