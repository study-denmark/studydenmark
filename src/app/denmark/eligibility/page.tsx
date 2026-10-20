import type { Metadata } from "next";
import { CountryPage } from "@/components/country-layout";
import { EligibilityQuiz } from "./quiz";

export const metadata: Metadata = {
  title: "Check your eligibility",
  description: "Five quick questions to see which Danish programmes you can apply for and when your deadline is.",
};

export default function Page() {
  return (
    <CountryPage
      eyebrow="Check eligibility"
      title="Check your eligibility"
      intro={<p>Five quick questions to see which Danish programmes you can apply for and when your deadline is.</p>}
    >
      <div className="max-w-2xl">
        <EligibilityQuiz />
      </div>
    </CountryPage>
  );
}
