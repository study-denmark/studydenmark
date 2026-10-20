// All study destinations. To add a country: add an entry here (and its flag in components/flag.tsx).
// Waitlist sources must also be allowed in app/actions/waitlist.ts.

import type { FlagCode } from "@/components/flag";

export type GuidePage = {
  href: string;
  label: string;
  /** Shown as a card on the country overview */
  card?: { title: string; body: string; image: string };
  /** Shown on the guide index when the page has no card */
  summary?: { title: string; body: string; image: string };
};

/** A tab in the country bar. `prefix` keeps it active on sub-pages (e.g. every guide page). */
export type CountryTab = { href: string; label: string; match?: "exact" | "prefix" };

export type SourceLink = { label: string; href: string };

export type ProgrammeType = { name: string; duration: string; note?: string };

export type Country = {
  id: string;
  name: string;
  /** Flag drawn by components/flag.tsx */
  flag: FlagCode;
  status: "available" | "coming-soon";
  /** Base path of the country section, e.g. /denmark */
  href?: string;
  /** Tabs in the country bar shown on all of this country's pages (see components/country-layout.tsx) */
  tabs?: CountryTab[];
  /** Official application portal, shown under the country name in the Study abroad menu */
  portal: string;
  /** Official sources, shown in the footer grouped by country */
  sources: SourceLink[];
  /** Footer sources on this country's own pages (defaults to `sources`) */
  pageSources?: SourceLink[];
  /** Stored in waitlist.source for the notify-me form */
  waitlistSource?: string;
  guide?: GuidePage[];
  programmeTypes?: ProgrammeType[];
  applicationPeriod?: { label: string };
};

export const countries: Country[] = [
  {
    id: "denmark",
    name: "Denmark",
    flag: "DK",
    status: "available",
    href: "/denmark",
    tabs: [
      { href: "/denmark", label: "Overview" },
      { href: "/denmark/programmes", label: "Programmes", match: "prefix" },
      { href: "/denmark/eligibility", label: "Check eligibility", match: "prefix" },
      { href: "/denmark/guide", label: "Guide", match: "prefix" },
    ],
    portal: "optagelse.dk",
    sources: [
      { label: "studyindenmark.dk", href: "https://studyindenmark.dk" },
      { label: "optagelse.dk", href: "https://www.optagelse.dk" },
    ],
    pageSources: [
      { label: "Study in Denmark", href: "https://studyindenmark.dk" },
      { label: "Optagelse.dk (applications)", href: "https://www.optagelse.dk" },
      { label: "New to Denmark (SIRI)", href: "https://www.nyidanmark.dk/en-GB" },
      { label: "International Citizen Service", href: "https://www.icitizen.dk" },
    ],
    guide: [
      {
        href: "/denmark/guide/student-life",
        label: "Student life",
        // No `card`: listed on the guide index only, not in the overview's four cards
        summary: { title: "Student life", body: "Small classes, project work with real companies and how teaching works.", image: "/images/library-band.jpg" },
      },
      {
        href: "/denmark/guide/eu-vs-non-eu",
        label: "EU/EEA vs. non-EU",
        card: { title: "EU/EEA vs. non-EU", body: "Who pays tuition, and who needs a residence permit.", image: "/images/guide-eu.jpg" },
      },
      {
        href: "/denmark/guide/admission-requirements",
        label: "Admission requirements",
        card: { title: "Admission requirements", body: "What your diploma and English score need to show.", image: "/images/guide-requirements.jpg" },
      },
      {
        href: "/denmark/guide/deadlines",
        label: "Deadlines",
        card: { title: "Deadlines", body: "The key dates for September and February intake.", image: "/images/guide-deadlines.jpg" },
      },
      {
        href: "/denmark/guide/cost-of-living",
        label: "Cost of living",
        card: { title: "Cost of living", body: "Rent, food, transport and what you can earn.", image: "/images/guide-cost.jpg" },
      },
    ],
    programmeTypes: [
      { name: "AP degree", duration: "2 years" },
      { name: "Professional bachelor", duration: "3.5 years" },
      { name: "University bachelor", duration: "3 years" },
      { name: "Master’s", duration: "2 years", note: "Apply directly to each university. Deadlines vary." },
    ],
    applicationPeriod: {
      label: "1 Feb – 15 Mar, 12:00 noon Danish time",
    },
  },
  {
    id: "sweden",
    name: "Sweden",
    flag: "SE",
    status: "coming-soon",
    portal: "universityadmissions.se",
    sources: [
      { label: "studyinsweden.se", href: "https://studyinsweden.se" },
      { label: "universityadmissions.se", href: "https://www.universityadmissions.se" },
    ],
    waitlistSource: "country:sweden",
  },
  {
    id: "norway",
    name: "Norway",
    flag: "NO",
    status: "coming-soon",
    portal: "Søknadsweb",
    sources: [
      { label: "studyinnorway.no", href: "https://www.studyinnorway.no" },
      { label: "soknadsweb.no", href: "https://www.soknadsweb.no" },
    ],
    waitlistSource: "country:norway",
  },
  {
    id: "finland",
    name: "Finland",
    flag: "FI",
    status: "coming-soon",
    portal: "Studyinfo.fi",
    sources: [
      { label: "studyinfinland.fi", href: "https://www.studyinfinland.fi" },
      { label: "studyinfo.fi", href: "https://studyinfo.fi" },
    ],
    waitlistSource: "country:finland",
  },
  {
    id: "netherlands",
    name: "Netherlands",
    flag: "NL",
    status: "coming-soon",
    portal: "Studielink",
    sources: [
      { label: "studyinholland.nl", href: "https://www.studyinholland.nl" },
      { label: "studielink.nl", href: "https://www.studielink.nl" },
    ],
    waitlistSource: "country:netherlands",
  },
];

export function getCountry(id: string): Country {
  const c = countries.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown country: ${id}`);
  return c;
}
