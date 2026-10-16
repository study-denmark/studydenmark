"use client";

import { useActionState, useState } from "react";
import { saveOnboarding, type OnboardingState } from "@/app/actions/profile";
import { EDUCATION_LEVELS, ENGLISH_TESTS, EU_EEA, FIELDS } from "@/lib/constants";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/auth-shell";

type Initial = Record<
  | "nationality"
  | "education_level"
  | "field_of_interest"
  | "english_test_type"
  | "english_test_score"
  | "desired_start"
  | "budget_eur_per_year",
  string
>;

const selectClass = `${inputClass} pr-10`;

export function OnboardingForm({
  firstTime,
  countries,
  intakes,
  initial,
}: {
  firstTime: boolean;
  countries: { code: string; name: string }[];
  intakes: string[];
  initial: Initial;
}) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(saveOnboarding, { error: null });
  const [nationality, setNationality] = useState(initial.nationality);
  const [testType, setTestType] = useState(initial.english_test_type);
  const test = ENGLISH_TESTS.find((t) => t.value === testType);
  const isEu = nationality ? EU_EEA.has(nationality) : null;

  return (
    <form action={action} className="mt-10 space-y-8">
      <input type="hidden" name="first_time" value={firstTime ? "1" : "0"} />

      <Section n="1" title="Where are you from?">
        <Field label="Nationality (as on your passport)">
          <select
            name="nationality"
            required
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className={selectClass}
          >
            <option value="" disabled>Choose a country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </Field>
        {isEu !== null && (
          <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm text-ink-soft">
            {isEu
              ? "Good news: as an EU/EEA or Swiss citizen you don’t pay tuition at public institutions."
              : "As a non-EU citizen you’ll pay tuition and need a student residence permit. We’ll show prices for you."}
          </p>
        )}
      </Section>

      <Section n="2" title="Your education">
        <Field label="Highest education completed – or completed before you start">
          <select name="education_level" required defaultValue={initial.education_level} className={selectClass}>
            <option value="" disabled>Choose one</option>
            {EDUCATION_LEVELS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </Field>
        <div className="mt-5">
          <Field label="What do you want to study?">
            <select name="field_of_interest" required defaultValue={initial.field_of_interest} className={selectClass}>
              <option value="" disabled>Choose a field</option>
              {FIELDS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section n="3" title="Your English">
        <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
          <Field label="English test">
            <select
              name="english_test_type"
              required
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className={selectClass}
            >
              <option value="" disabled>Choose one</option>
              {ENGLISH_TESTS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          {test && test.value !== "none" && (
            <Field label="Your score" hint={test.hint}>
              <input
                key={test.value}
                name="english_test_score"
                type="number"
                inputMode="decimal"
                required
                step={test.step}
                min={test.min}
                max={test.max}
                defaultValue={initial.english_test_type === test.value ? initial.english_test_score : ""}
                className={inputClass}
              />
            </Field>
          )}
        </div>
        {testType === "none" && (
          <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm">
            Most programmes need a test result before the deadline. We’ll show you what each one requires.
          </p>
        )}
      </Section>

      <Section n="4" title="Timing and budget">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="When do you want to start?">
            <select name="desired_start" defaultValue={initial.desired_start} className={selectClass}>
              <option value="">Not sure yet</option>
              {intakes.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Max tuition per year (€)"
            hint={isEu ? "Optional – most programmes are free for you" : "Optional – leave empty if you’re not sure"}
          >
            <input
              name="budget_eur_per_year"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              placeholder="e.g. 10000"
              defaultValue={initial.budget_eur_per_year}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <FormError message={state.error} />
      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">You can change this any time.</p>
        <Button type="submit" disabled={pending} className="sm:min-w-56">
          {pending ? "Saving…" : firstTime ? "Show my matches" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{n}</span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}
