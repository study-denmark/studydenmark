import type { EducationLevel } from "@/lib/constants";
import type { ProgrammeLevel } from "@/lib/labels";

export type Institution = {
  id: string;
  slug: string;
  name: string;
  type: "business_academy" | "university_college" | "university" | "private_school" | "other";
  city: string | null;
  website: string | null;
  description: string | null;
  is_partner: boolean;
};

export type Programme = {
  id: string;
  institution_id: string;
  slug: string;
  title: string;
  level: ProgrammeLevel;
  field: string;
  city: string;
  description: string | null;
  teaching_language: string;
  duration_months: number | null;
  ects: number | null;
  tuition_eu_eur_per_year: number | null;
  tuition_non_eu_eur_per_year: number | null;
  application_deadline_eu: string | null;
  application_deadline_non_eu: string | null;
  intake: string | null;
  admission_requirements: string | null;
  language_requirements: string | null;
  min_ielts: number | null;
  min_toefl: number | null;
  accepted_education_levels: EducationLevel[];
  source_url: string | null;
  last_verified_at: string | null;
  is_published: boolean;
  is_public_preview: boolean;
};

export type ProgrammeWithInstitution = Programme & {
  institutions: Pick<Institution, "name" | "slug" | "is_partner" | "type" | "website"> | null;
};

export type StudentProfile = {
  id: string;
  full_name: string | null;
  role: "student" | "admin";
  nationality: string | null;
  is_eu_eea: boolean | null;
  education_level: EducationLevel | null;
  field_of_interest: string | null;
  english_test_type: string | null;
  english_test_score: number | null;
  desired_level: ProgrammeLevel | null;
  desired_start: string | null;
  budget_eur_per_year: number | null;
  onboarding_completed_at: string | null;
};

export const PROGRAMME_SELECT =
  "*, institutions(name, slug, is_partner, type, website)" as const;
