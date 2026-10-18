import { site } from "@/config/site";

export type Plan = "basic" | "premium";

export const PLANS: Plan[] = ["basic", "premium"];

export const planFeatures: Record<Plan, string[]> = {
  basic: [
    "Full database of English-taught programmes",
    "Personal matches based on your profile",
    "Requirements, tuition and deadlines per programme",
    "Which documents each programme asks for",
    "Save programmes to your shortlist",
  ],
  premium: [
    "Everything in Basic",
    "Personal document checklist for your chosen programmes",
    "Secure document upload – we check every document",
    "We help you apply to the schools you choose",
    "Follow your applications step by step",
  ],
};

export const planLabel = (p: Plan | null | undefined) => (p ? site.plans[p].name : "—");

export function isPlan(v: unknown): v is Plan {
  return v === "basic" || v === "premium";
}
