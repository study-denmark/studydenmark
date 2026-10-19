import type { Metadata } from "next";
import { GuideLayout } from "@/components/guide-layout";
import { officialSources } from "@/config/site";

export const metadata: Metadata = { title: "Application deadlines" };

const timeline = [
  ["1 February", "optagelse.dk opens for applications to programmes starting in the summer/September."],
  ["15 March, 12:00 noon", "Main deadline for international applicants (quota 2). Also the deadline at many schools for language test results if you need a residence permit."],
  ["Around 1 March", "Common master’s deadline for non-EU applicants at universities (varies – check each programme)."],
  ["5 July, 12:00 noon", "Quota 1 deadline and the last day to document that you meet the entry requirements."],
  ["Late July", "Admission answers are sent out."],
  ["Around 1 September", "Typical deadline for programmes starting in February (winter intake), where offered."],
];

export default function Page() {
  return (
    <GuideLayout
      current="/denmark/guide/deadlines"
      title="Application deadlines"
      intro="Missing a deadline usually means waiting a full year. These are the dates that matter for most international students."
    >
      <p>
        All times are Danish time (CET/CEST). Deadlines are strict – the system closes at exactly 12:00 noon.
      </p>

      <ol className="not-prose my-8 space-y-0 border-l-2 border-line">
        {timeline.map(([date, text]) => (
          <li key={date} className="relative pb-6 pl-6 last:pb-0">
            <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-accent" />
            <p className="font-semibold text-ink">{date}</p>
            <p className="mt-1 text-[15px] text-ink-soft">{text}</p>
          </li>
        ))}
      </ol>

      <h2>Quota 1 vs. quota 2</h2>
      <p>
        Danish admission splits places into two “quotas”. <strong>Quota 1</strong> is based purely on your
        grade average. <strong>Quota 2</strong> looks at other criteria too, such as motivation, experience
        and specific subjects. Most international applicants apply in quota 2, which means the{" "}
        <strong>15 March</strong> deadline.
      </p>

      <h2>Non-EU? Start early</h2>
      <p>
        After admission you still need a residence permit, which can take up to two months. Work backwards
        from your study start and leave room for it.
      </p>

      <p>
        Official dates: <a href={officialSources.optagelse}>optagelse.dk</a> and{" "}
        <a href={officialSources.ug}>ug.dk</a>.
      </p>
    </GuideLayout>
  );
}
