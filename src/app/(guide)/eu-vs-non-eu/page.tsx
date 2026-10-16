import type { Metadata } from "next";
import { GuideLayout } from "@/components/guide-layout";
import { officialSources } from "@/config/site";

export const metadata: Metadata = { title: "EU/EEA vs. non-EU students" };

const rows = [
  ["Tuition fees", "Free at public institutions", "Usually between €6,000 and €16,000 a year"],
  ["Application fee", "No", "Some institutions charge one"],
  ["Residence permit", "Not needed – register after arrival (EU residence document)", "Student residence permit from SIRI before you travel"],
  ["Work while studying", "No hour limit", "Up to 20 hours/week, full-time in June, July and August"],
  ["Typical deadline (Sept. start)", "15 March or 5 July, depending on programme", "15 March, 12:00 noon"],
  ["Scholarships", "Rarely needed – tuition is free", "Limited government scholarships, applied for via the school"],
];

export default function Page() {
  return (
    <GuideLayout
      current="/eu-vs-non-eu"
      title="EU/EEA vs. non-EU students"
      intro="Your citizenship decides two big things: whether you pay tuition, and whether you need a residence permit. Here’s the difference."
    >
      <p>
        “EU/EEA” here means citizens of EU countries, Iceland, Liechtenstein, Norway – and Switzerland, which
        is treated the same way. Everyone else is “non-EU”. Some non-EU students with a permanent or certain
        temporary Danish residence permit are also exempt from tuition.
      </p>

      <div className="not-prose my-8 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
        <div className="hidden grid-cols-[1fr_1fr_1fr] border-b border-line bg-paper text-sm font-semibold sm:grid">
          <div className="px-4 py-3"></div>
          <div className="px-4 py-3">EU/EEA & Swiss</div>
          <div className="px-4 py-3">Non-EU</div>
        </div>
        {rows.map(([k, eu, non]) => (
          <div key={k} className="grid border-b border-line text-[15px] last:border-0 sm:grid-cols-[1fr_1fr_1fr]">
            <div className="px-4 pt-3 font-semibold text-ink sm:py-3">{k}</div>
            <div className="px-4 py-1 sm:py-3"><span className="text-xs text-muted sm:hidden">EU/EEA: </span>{eu}</div>
            <div className="px-4 pb-3 pt-1 sm:py-3"><span className="text-xs text-muted sm:hidden">Non-EU: </span>{non}</div>
          </div>
        ))}
      </div>

      <h2>If you are an EU/EEA or Swiss citizen</h2>
      <p>
        You can study for free at public institutions. After arriving, you register for an{" "}
        <strong>EU residence document</strong> and a <strong>CPR number</strong> (your Danish personal ID),
        usually at an International Citizen Service centre. See{" "}
        <a href={officialSources.ics}>icitizen.dk</a>.
      </p>

      <h2>If you are a non-EU citizen</h2>
      <p>
        You pay tuition, and you need a <strong>student residence permit</strong> from the Danish Agency for
        International Recruitment and Integration (SIRI). You can apply once you’ve been admitted. As part of
        the application you’ll typically need to:
      </p>
      <ul>
        <li>Show your letter of admission</li>
        <li>Show proof that you’ve paid tuition for the first semester or year (if required)</li>
        <li>Document that you can support yourself financially – SIRI sets the amount</li>
        <li>Pay the application fee and book a biometrics appointment</li>
      </ul>
      <p>
        Processing can take up to two months, so apply as early as you can. Full rules:{" "}
        <a href={officialSources.nyIDanmark}>nyidanmark.dk</a>.
      </p>
    </GuideLayout>
  );
}
