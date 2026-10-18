// Central config. Change the brand name, price text and contact here.
export const site = {
  name: "StudyDenmark Guide",
  shortName: "StudyDenmark",
  tagline: "Find out exactly what you can study in Denmark – and get help applying.",
  description:
    "Personal guidance for international students: entry requirements, English-taught programmes, deadlines and help collecting your application documents.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "bk@veritas-group.dk", // TODO: replace with a study-denmark.com address
  // The business behind the site. Shown in Terms, Privacy and the footer.
  company: {
    name: "Study Denmark",
    cvr: null as string | null, // TODO: add when registered
    address: "Willemoesgade 16a, 6700 Esbjerg, Denmark",
  },
  // Display only. The real prices are the default prices of the Stripe products in .env (in EUR)
  plans: {
    basic: { name: "Basic", amountLabel: "€12.95", approx: "≈ DKK 97", interval: "year" },
    premium: { name: "Premium", amountLabel: "€66.95", approx: "≈ DKK 500", interval: "year" },
  },
  // Cheapest plan, used in "from €12.95" texts
  price: { amountLabel: "€12.95", approx: "≈ DKK 97", interval: "year" },
  // Bump this when Terms / Privacy text changes. Stored with every consent.
  consentVersion: "2026-10-18",
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
