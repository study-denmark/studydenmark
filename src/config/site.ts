import { getCountry } from "@/config/countries";

// Central config. Change the brand name, price text and contact here.
export const site = {
  name: "NorthStep",
  shortName: "NorthStep",
  tagline: "Find out exactly what you can study abroad, and get help applying.",
  description:
    "Personal guidance for international students: entry requirements, English-taught programmes, deadlines and help collecting your application documents.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "hello@study-denmark.com",
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

// Main nav links; the "Study abroad" country menu is rendered before them
export const publicNav = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

// Sidebar of the Denmark guide pages
export const guideNav = (getCountry("denmark").guide ?? []).map(({ href, label }) => ({ href, label }));
