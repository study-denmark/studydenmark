import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { EligibilityQuiz } from "./quiz";

export const metadata: Metadata = {
  title: "Check your eligibility",
  description: "Five quick questions to see which Danish programmes you can apply for and when your deadline is.",
};

export default function Page() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <EligibilityQuiz />
      </div>
    </Container>
  );
}
