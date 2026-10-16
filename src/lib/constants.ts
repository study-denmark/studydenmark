import type { ProgrammeLevel } from "@/lib/labels";

export const FIELDS = [
  "Business & Marketing",
  "IT & Computer Science",
  "Engineering & Technology",
  "Design & Media",
  "Hospitality, Tourism & Events",
  "Logistics & Supply Chain",
  "Finance & Economics",
  "Health & Social Care",
  "Natural Sciences",
  "Social Sciences & Humanities",
  "Other",
] as const;

export type EducationLevel = "upper_secondary" | "academy_profession" | "bachelor" | "master";

export const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: "upper_secondary", label: "High school / upper secondary" },
  { value: "academy_profession", label: "2-year vocational or AP degree" },
  { value: "bachelor", label: "Bachelor’s degree" },
  { value: "master", label: "Master’s degree" },
];

export const ENGLISH_TESTS = [
  { value: "IELTS", label: "IELTS Academic", hint: "e.g. 6.5", step: "0.5", min: 0, max: 9 },
  { value: "TOEFL", label: "TOEFL iBT", hint: "e.g. 90", step: "1", min: 0, max: 120 },
  { value: "Cambridge", label: "Cambridge (C1/C2 scale)", hint: "e.g. 180", step: "1", min: 100, max: 230 },
  { value: "PTE", label: "PTE Academic", hint: "e.g. 62", step: "1", min: 10, max: 90 },
  { value: "Duolingo", label: "Duolingo English Test", hint: "e.g. 115", step: "5", min: 10, max: 160 },
  { value: "none", label: "I haven’t taken a test yet", hint: "", step: "1", min: 0, max: 0 },
] as const;

/** Upcoming intakes shown in onboarding. Computed so the list never goes stale. */
export function upcomingIntakes(now = new Date()): string[] {
  const out: string[] = [];
  const y = now.getFullYear();
  for (const year of [y, y + 1, y + 2]) {
    for (const [month, idx] of [["February", 1], ["September", 8]] as const) {
      if (new Date(year, idx, 1) > now) out.push(`${month} ${year}`);
    }
  }
  return out.slice(0, 4);
}

/** Which programme levels each completed education level opens up. */
export function eligibleLevels(education?: EducationLevel | null): ProgrammeLevel[] {
  switch (education) {
    case "upper_secondary":
      return ["academy_profession", "professional_bachelor", "bachelor"];
    case "academy_profession":
      return ["top_up", "professional_bachelor", "bachelor"];
    case "bachelor":
    case "master":
      return ["master"];
    default:
      return [];
  }
}

// EU/EEA + Switzerland: no tuition at public institutions, no residence permit.
export const EU_EEA = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV",
  "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "CH",
]);

const CODES =
  "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW".split(" ");

export function countryOptions(): { code: string; name: string }[] {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return CODES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function countryName(code?: string | null) {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Rough conversion of other English tests to an IELTS band, used only to flag
 * whether a student is likely to meet a programme's IELTS requirement.
 */
export function toIeltsBand(test?: string | null, score?: number | null): number | null {
  if (!test || test === "none" || score == null) return null;
  const table: Record<string, [number, number][]> = {
    // [minimum score, IELTS band]
    TOEFL: [[115, 8.5], [110, 8], [102, 7.5], [94, 7], [79, 6.5], [60, 6], [46, 5.5], [35, 5]],
    Cambridge: [[200, 8], [191, 7.5], [185, 7], [176, 6.5], [169, 6], [162, 5.5], [154, 5]],
    PTE: [[84, 8.5], [79, 8], [73, 7.5], [65, 7], [58, 6.5], [50, 6], [43, 5.5], [36, 5]],
    Duolingo: [[150, 8.5], [140, 8], [130, 7.5], [120, 7], [105, 6.5], [95, 6], [85, 5.5], [75, 5]],
  };
  if (test === "IELTS") return score;
  for (const [min, band] of table[test] ?? []) if (score >= min) return band;
  return 4.5;
}
