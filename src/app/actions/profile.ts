"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EDUCATION_LEVELS, ENGLISH_TESTS, EU_EEA, FIELDS } from "@/lib/constants";

export type OnboardingState = { error: string | null };

export async function saveOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  const nationality = String(formData.get("nationality") ?? "").toUpperCase();
  const education = String(formData.get("education_level") ?? "");
  const field = String(formData.get("field_of_interest") ?? "");
  const testType = String(formData.get("english_test_type") ?? "");
  const rawScore = String(formData.get("english_test_score") ?? "").replace(",", ".");
  const start = String(formData.get("desired_start") ?? "");
  const rawBudget = String(formData.get("budget_eur_per_year") ?? "").replace(/[^\d]/g, "");

  if (!/^[A-Z]{2}$/.test(nationality)) return { error: "Please choose your nationality." };
  if (!EDUCATION_LEVELS.some((e) => e.value === education)) return { error: "Please choose your education level." };
  if (!(FIELDS as readonly string[]).includes(field)) return { error: "Please choose what you want to study." };
  const test = ENGLISH_TESTS.find((t) => t.value === testType);
  if (!test) return { error: "Please tell us about your English test." };

  let score: number | null = null;
  if (testType !== "none") {
    score = Number(rawScore);
    if (!rawScore || Number.isNaN(score) || score < test.min || score > test.max) {
      return { error: `Please enter a valid ${test.label} score (${test.min}–${test.max}).` };
    }
  }

  const budget = rawBudget ? Number(rawBudget) : null;
  const firstTime = formData.get("first_time") === "1";

  const { error } = await supabase
    .from("profiles")
    .update({
      nationality,
      is_eu_eea: EU_EEA.has(nationality),
      education_level: education,
      field_of_interest: field,
      english_test_type: testType,
      english_test_score: score,
      desired_start: start || null,
      budget_eur_per_year: budget,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[onboarding]", error);
    return { error: "We couldn’t save your profile. Please try again." };
  }

  revalidatePath("/dashboard");
  redirect(firstTime ? "/dashboard?welcome=1" : "/dashboard");
}
