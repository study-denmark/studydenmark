import { site } from "@/config/site";

export type Plan = "basic" | "premium";

export const PLANS: Plan[] = ["basic", "premium"];

export const planFeatures: Record<Plan, string[]> = {
  basic: [
    "See which programmes you can apply for and where",
    "Requirements, tuition and deadlines per programme",
    "Which documents each programme asks for",
    "Save programmes to your shortlist",
    "Apply on your own",
  ],
  premium: [
    "Everything in Basic",
    "Your personal document checklist",
    "Secure upload",
    "We check your documents",
    "CV and motivational letter templates with clear examples",
    "Guidance to student accommodation sites",
    "We help you apply to the schools you choose, with step-by-step tracking",
  ],
};

export const planLabel = (p: Plan | null | undefined) => (p ? site.plans[p].name : "—");

export function isPlan(v: unknown): v is Plan {
  return v === "basic" || v === "premium";
}
