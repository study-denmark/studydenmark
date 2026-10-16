import type { Metadata } from "next";
import { requireSubscriber } from "@/lib/auth";
import { countryOptions, upcomingIntakes } from "@/lib/constants";
import type { StudentProfile } from "@/lib/types";
import { Container } from "@/components/ui";
import { OnboardingForm } from "./form";

export const metadata: Metadata = { title: "Your profile" };

export default async function OnboardingPage() {
  const { profile } = await requireSubscriber();
  const p = profile as StudentProfile;
  const firstTime = !p.onboarding_completed_at;

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium text-sea">{firstTime ? "About 3 minutes" : "Your profile"}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          {firstTime ? "Tell us about yourself" : "Update your profile"}
        </h1>
        <p className="mt-3 text-ink-soft">
          We use this to show the programmes you can actually apply for – and flag anything you’ll need to sort out first.
        </p>
        <OnboardingForm
          firstTime={firstTime}
          countries={countryOptions()}
          intakes={upcomingIntakes()}
          initial={{
            nationality: p.nationality ?? "",
            education_level: p.education_level ?? "",
            field_of_interest: p.field_of_interest ?? "",
            english_test_type: p.english_test_type ?? "",
            english_test_score: p.english_test_score?.toString() ?? "",
            desired_start: p.desired_start ?? "",
            budget_eur_per_year: p.budget_eur_per_year?.toString() ?? "",
          }}
        />
      </div>
    </Container>
  );
}
