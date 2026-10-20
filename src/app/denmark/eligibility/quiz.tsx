"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { levelLabels } from "@/lib/labels";
import { eligibleLevels } from "@/lib/constants";
import { site } from "@/config/site";

type Answers = {
  citizenship?: "eu" | "non_eu";
  education?: "upper_secondary" | "academy_profession" | "bachelor" | "master";
  english?: "high" | "mid" | "low" | "none";
  field?: string;
  start?: "september" | "february" | "later";
};

type Question = {
  key: keyof Answers;
  title: string;
  help?: string;
  options: { value: string; label: string }[];
};

const questions: Question[] = [
  {
    key: "citizenship",
    title: "Where are you a citizen?",
    help: "This decides tuition and whether you need a residence permit.",
    options: [
      { value: "eu", label: "An EU/EEA country or Switzerland" },
      { value: "non_eu", label: "Another country" },
    ],
  },
  {
    key: "education",
    title: "What’s the highest education you have completed – or will complete before starting?",
    options: [
      { value: "upper_secondary", label: "High school / upper secondary" },
      { value: "academy_profession", label: "A 2-year vocational or AP degree" },
      { value: "bachelor", label: "A bachelor’s degree" },
      { value: "master", label: "A master’s degree" },
    ],
  },
  {
    key: "english",
    title: "How strong is your English, on paper?",
    help: "IELTS Academic or the equivalent TOEFL / Cambridge score.",
    options: [
      { value: "high", label: "IELTS 6.5 or higher" },
      { value: "mid", label: "IELTS 6.0" },
      { value: "low", label: "Below IELTS 6.0" },
      { value: "none", label: "I haven’t taken a test yet" },
    ],
  },
  {
    key: "field",
    title: "What would you like to study?",
    options: [
      { value: "Business & marketing", label: "Business & marketing" },
      { value: "IT & computer science", label: "IT & computer science" },
      { value: "Engineering", label: "Engineering" },
      { value: "Design & media", label: "Design & media" },
      { value: "Hospitality & tourism", label: "Hospitality & tourism" },
      { value: "Not sure yet", label: "Not sure yet" },
    ],
  },
  {
    key: "start",
    title: "When would you like to start?",
    options: [
      { value: "september", label: "Next September" },
      { value: "february", label: "Next February" },
      { value: "later", label: "Later than that" },
    ],
  },
];

export function EligibilityQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [count, setCount] = useState<number | null>(null);
  const done = step >= questions.length;
  const levels = useMemo(() => eligibleLevels(answers.education), [answers.education]);

  useEffect(() => {
    if (!done || levels.length === 0) return;
    const supabase = createClient();
    Promise.all(levels.map((l) => supabase.rpc("count_published_programmes", { p_level: l })))
      .then((res) => setCount(res.reduce((sum, r) => sum + (typeof r.data === "number" ? r.data : 0), 0)))
      .catch(() => setCount(null));
  }, [done, levels]);

  function choose(key: keyof Answers, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  }

  if (!done) {
    const q = questions[step];
    return (
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${(step / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-sm tabular-nums text-muted">
            {step + 1} / {questions.length}
          </span>
        </div>
        <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">{q.title}</h2>
        {q.help && <p className="mt-3 text-ink-soft">{q.help}</p>}
        <div className="mt-8 grid gap-3">
          {q.options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(q.key, o.value)}
              className={`flex items-center justify-between rounded-xl border bg-surface px-5 py-4 text-left text-[16px] transition-colors hover:border-ink/40 ${
                answers[q.key] === o.value ? "border-ink" : "border-line"
              }`}
            >
              {o.label}
              <span aria-hidden className="text-muted">→</span>
            </button>
          ))}
        </div>
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="mt-6 text-sm text-muted underline underline-offset-4 hover:text-ink">
            ← Back
          </button>
        )}
      </div>
    );
  }

  const nonEu = answers.citizenship === "non_eu";
  const isMaster = levels.includes("master");
  const deadline =
    answers.start === "february"
      ? "Around 1 September, for programmes with a February intake"
      : isMaster
        ? nonEu
          ? "Often 1 March for non-EU applicants (varies by university)"
          : "Usually between 1 March and 1 April (varies by university)"
        : "15 March at 12:00 noon, Danish time";

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-sea">Your result</p>
      <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
        Good news – you can apply to study in Denmark.
      </h2>

      <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface p-6">
        <p className="text-sm font-semibold text-muted">Programme types open to you</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {levels.map((l) => (
            <li key={l} className="rounded-full bg-sea-soft px-3 py-1.5 text-sm font-medium text-sea">
              {levelLabels[l]}
            </li>
          ))}
        </ul>
        {count !== null && count > 0 && (
          <p className="mt-4 text-[15px] text-ink-soft">
            We list <strong className="text-ink">{count}</strong> English-taught programmes at these levels.
          </p>
        )}

        <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Tuition</dt>
            <dd className="mt-1 font-medium">
              {nonEu ? "Yes – usually €6,000–16,000 a year" : "Free at public institutions"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Residence permit</dt>
            <dd className="mt-1 font-medium">{nonEu ? "Required – apply after admission" : "Not needed"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted">Your likely deadline</dt>
            <dd className="mt-1 font-medium">{deadline}</dd>
          </div>
        </dl>

        {(answers.english === "low" || answers.english === "none") && (
          <div className="mt-6 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3 text-[15px]">
            <strong>Plan your English test now.</strong> Most programmes ask for IELTS 6.0–6.5 or more, and
            {nonEu ? " if you need a residence permit, some schools want the result by 15 March." : " results must be in before the deadline."}
          </div>
        )}
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-6">
        <div aria-hidden className="pointer-events-none select-none space-y-3 blur-[5px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-paper px-4 py-3">
              <span className="font-medium">Programme name in {answers.field ?? "your field"}</span>
              <span className="text-sm text-muted">City · Deadline</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/60 px-6 text-center">
          <p className="max-w-sm font-semibold">
            See the exact programmes in {answers.field && answers.field !== "Not sure yet" ? answers.field.toLowerCase() : "your field"} you qualify for
          </p>
          <Link href="/signup" className="mt-4 rounded-full bg-ink px-5 py-3 font-medium text-white hover:bg-ink-soft">
            Unlock from {site.price.amountLabel}/{site.price.interval}
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setAnswers({});
          setStep(0);
          setCount(null);
        }}
        className="mt-6 text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        Start over
      </button>
      <p className="mt-6 text-xs text-muted">
        This is a general guide based on official Danish rules. Your exact eligibility depends on each
        programme’s specific requirements.
      </p>
    </div>
  );
}
