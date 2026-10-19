import type { Metadata } from "next";
import { GuideLayout } from "@/components/guide-layout";
import { officialSources } from "@/config/site";

export const metadata: Metadata = { title: "Cost of living" };

const budget = [
  ["Rent (room or dorm)", "3,500 – 6,500"],
  ["Food", "2,000 – 2,500"],
  ["Transport", "300 – 500"],
  ["Phone & internet", "150 – 300"],
  ["Books & materials", "200 – 400"],
  ["Other (leisure, clothes)", "800 – 1,500"],
];

export default function Page() {
  return (
    <GuideLayout
      current="/denmark/guide/cost-of-living"
      title="Cost of living"
      intro="Denmark isn’t cheap, but students make it work. Here’s a realistic monthly budget and what you can earn on the side."
    >
      <h2>A typical student budget</h2>
      <p>Monthly figures in Danish kroner (DKK). €1 is about DKK 7.46.</p>

      <div className="not-prose my-6 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
        {budget.map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-line px-4 py-3 text-[15px]">
            <span className="text-ink-soft">{k}</span>
            <span className="font-medium tabular-nums">{v}</span>
          </div>
        ))}
        <div className="flex justify-between bg-paper px-4 py-3 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">≈ 7,000 – 11,500</span>
        </div>
      </div>
      <p>
        Copenhagen is the most expensive city, mostly because of rent. Esbjerg, Odense, Aalborg, Kolding and
        Horsens are noticeably cheaper.
      </p>

      <h2>Working while you study</h2>
      <ul>
        <li><strong>EU/EEA & Swiss:</strong> you can work as much as you like.</li>
        <li>
          <strong>Non-EU:</strong> up to <strong>20 hours a week</strong> during the semester and full-time in
          June, July and August.
        </li>
      </ul>
      <p>
        Typical student jobs pay well by international standards, but don’t count on a job to cover tuition –
        non-EU students must document that they can support themselves before getting a residence permit.
      </p>

      <h2>Housing tips</h2>
      <ul>
        <li>Ask your school about dorm places as soon as you’re admitted.</li>
        <li>Never pay a deposit for a room you haven’t seen without a written contract – housing scams target international students.</li>
        <li>Expect to pay a deposit of up to three months’ rent plus the first month in advance.</li>
      </ul>

      <p>
        More: <a href={`${officialSources.studyInDenmark}/live-in-denmark`}>studyindenmark.dk – live in Denmark</a>.
      </p>
    </GuideLayout>
  );
}
