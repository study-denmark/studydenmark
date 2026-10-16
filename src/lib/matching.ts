import { eligibleLevels, toIeltsBand } from "@/lib/constants";
import type { ProgrammeWithInstitution, StudentProfile } from "@/lib/types";

export type MatchCheck = { ok: boolean | null; label: string };

export type Match = {
  programme: ProgrammeWithInstitution;
  eligibleLevel: boolean;
  score: number; // 0–100
  tier: "strong" | "good" | "possible";
  tuition: number | null; // € per year for THIS student
  deadline: string | null; // for THIS student
  checks: MatchCheck[];
};

const today = () => new Date(new Date().toDateString());

export function tuitionFor(p: ProgrammeWithInstitution, isEu: boolean | null) {
  return isEu ? (p.tuition_eu_eur_per_year ?? 0) : p.tuition_non_eu_eur_per_year;
}

export function deadlineFor(p: ProgrammeWithInstitution, isEu: boolean | null) {
  return isEu ? (p.application_deadline_eu ?? p.application_deadline_non_eu) : (p.application_deadline_non_eu ?? p.application_deadline_eu);
}

/**
 * Scores one programme for one student. Transparent rules, no black box:
 *  - Level must fit the student's completed education (hard requirement)
 *  - Field of interest       40 pts
 *  - English requirement     25 pts
 *  - Within budget           20 pts
 *  - Deadline still open     10 pts
 *  - Partner school           5 pts (small nudge; always labelled "Partner")
 */
export function matchProgramme(p: ProgrammeWithInstitution, s: StudentProfile): Match {
  const levels = eligibleLevels(s.education_level);
  const accepted = p.accepted_education_levels?.length ? p.accepted_education_levels : null;
  const eligibleLevel =
    levels.includes(p.level) && (!accepted || (s.education_level ? accepted.includes(s.education_level) : false));

  const checks: MatchCheck[] = [];
  let score = 0;

  // Field
  const fieldMatch = !!s.field_of_interest && (s.field_of_interest === p.field || s.field_of_interest === "Other");
  if (fieldMatch) score += 40;
  checks.push({ ok: fieldMatch ? true : null, label: fieldMatch ? `Matches your interest in ${p.field}` : `Field: ${p.field}` });

  // English
  const band = toIeltsBand(s.english_test_type, s.english_test_score);
  let englishOk: boolean | null = null;
  if (p.min_ielts == null && p.min_toefl == null) {
    englishOk = null;
    checks.push({ ok: null, label: "English requirement not listed – check with the school" });
  } else if (s.english_test_type === "TOEFL" && p.min_toefl != null && s.english_test_score != null) {
    englishOk = s.english_test_score >= p.min_toefl;
  } else if (band != null && p.min_ielts != null) {
    englishOk = band >= p.min_ielts;
  }
  if (p.min_ielts != null || p.min_toefl != null) {
    const req = p.min_ielts != null ? `IELTS ${Number(p.min_ielts).toFixed(1)}` : `TOEFL ${p.min_toefl}`;
    checks.push({
      ok: englishOk,
      label:
        englishOk === true
          ? `Your English score meets ${req}`
          : englishOk === false
            ? `Requires ${req} – above your current score`
            : `Requires ${req} – you’ll need a test result`,
    });
  }
  if (englishOk !== false) score += englishOk ? 25 : 12;

  // Budget
  const tuition = tuitionFor(p, s.is_eu_eea);
  let budgetOk: boolean | null = null;
  if (tuition === 0) budgetOk = true;
  else if (tuition != null && s.budget_eur_per_year != null) budgetOk = tuition <= s.budget_eur_per_year;
  if (budgetOk) score += 20;
  else if (budgetOk === null) score += 10;
  checks.push({
    ok: budgetOk,
    label:
      tuition === 0
        ? "No tuition fee for you"
        : tuition == null
          ? "Tuition not listed"
          : budgetOk
            ? `€${tuition.toLocaleString("en")} / year – within your budget`
            : `€${tuition.toLocaleString("en")} / year${s.budget_eur_per_year != null ? " – above your budget" : ""}`,
  });

  // Deadline
  const deadline = deadlineFor(p, s.is_eu_eea);
  const open = deadline ? new Date(deadline) >= today() : null;
  if (open !== false) score += 10;
  if (deadline) {
    checks.push({
      ok: open,
      label: open
        ? `Apply by ${new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
        : "This year’s deadline has passed",
    });
  }

  if (p.institutions?.is_partner) score += 5;

  const tier = score >= 80 ? "strong" : score >= 55 ? "good" : "possible";
  return { programme: p, eligibleLevel, score, tier, tuition, deadline, checks };
}

export function rankMatches(programmes: ProgrammeWithInstitution[], s: StudentProfile) {
  return programmes
    .map((p) => matchProgramme(p, s))
    .filter((m) => m.eligibleLevel)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(!!b.programme.institutions?.is_partner) - Number(!!a.programme.institutions?.is_partner) ||
        a.programme.title.localeCompare(b.programme.title),
    );
}

export const tierLabels = {
  strong: "Strong match",
  good: "Good match",
  possible: "Possible – check requirements",
} as const;
