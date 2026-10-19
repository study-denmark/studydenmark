"use client";

import { useActionState } from "react";
import { deleteProgramme, saveProgramme, type AdminState } from "@/app/actions/admin";
import { EDUCATION_LEVELS, FIELDS } from "@/lib/constants";
import { levelLabels, type ProgrammeLevel } from "@/lib/labels";
import type { Programme } from "@/lib/types";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/auth-shell";

const DOCS = [
  ["passport", "Passport"],
  ["diploma", "Diploma(s)"],
  ["transcript", "Transcript of grades"],
  ["language_test", "English test result"],
  ["cv", "CV"],
  ["motivation_letter", "Motivation letter"],
  ["recommendation", "Recommendation letter"],
] as const;

export function ProgrammeForm({
  programme: p,
  institutions,
  docs,
}: {
  programme: Programme | null;
  institutions: { id: string; name: string; city: string | null }[];
  docs: string[];
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveProgramme, { error: null });
  const defaultDocs = p ? docs : ["passport", "diploma", "transcript", "language_test"];

  return (
    <>
      <form action={action} className="mt-8 space-y-8">
        {p && <input type="hidden" name="id" value={p.id} />}

        <Group title="Basics">
          <Field label="Programme title *">
            <input name="title" required defaultValue={p?.title} className={inputClass} placeholder="e.g. AP Degree in Marketing Management" />
          </Field>
          <Field label="Institution *">
            <select name="institution_id" required defaultValue={p?.institution_id ?? ""} className={inputClass}>
              <option value="" disabled>Choose…</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>{i.name}{i.city ? ` (${i.city})` : ""}</option>
              ))}
            </select>
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Level *">
              <select name="level" required defaultValue={p?.level ?? ""} className={inputClass}>
                <option value="" disabled>Choose…</option>
                {(Object.keys(levelLabels) as ProgrammeLevel[]).map((l) => (
                  <option key={l} value={l}>{levelLabels[l]}</option>
                ))}
              </select>
            </Field>
            <Field label="Field *">
              <select name="field" required defaultValue={p?.field ?? ""} className={inputClass}>
                <option value="" disabled>Choose…</option>
                {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="City *">
              <input name="city" required defaultValue={p?.city} className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Duration (months)"><input name="duration_months" type="number" defaultValue={p?.duration_months ?? ""} className={inputClass} /></Field>
            <Field label="ECTS"><input name="ects" type="number" defaultValue={p?.ects ?? ""} className={inputClass} /></Field>
            <Field label="Intake"><input name="intake" defaultValue={p?.intake ?? ""} placeholder="September" className={inputClass} /></Field>
          </div>
          <Field label="Description">
            <textarea name="description" rows={5} defaultValue={p?.description ?? ""} className={inputClass} />
          </Field>
        </Group>

        <Group title="Tuition & deadlines">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tuition EU/EEA (€/year)" hint="0 for public institutions">
              <input name="tuition_eu_eur_per_year" type="number" defaultValue={p?.tuition_eu_eur_per_year ?? 0} className={inputClass} />
            </Field>
            <Field label="Tuition non-EU (€/year)">
              <input name="tuition_non_eu_eur_per_year" type="number" defaultValue={p?.tuition_non_eu_eur_per_year ?? ""} className={inputClass} />
            </Field>
            <Field label="Deadline EU/EEA"><input name="application_deadline_eu" type="date" defaultValue={p?.application_deadline_eu ?? ""} className={inputClass} /></Field>
            <Field label="Deadline non-EU"><input name="application_deadline_non_eu" type="date" defaultValue={p?.application_deadline_non_eu ?? ""} className={inputClass} /></Field>
          </div>
        </Group>

        <Group title="Requirements">
          <Field label="Admission requirements">
            <textarea name="admission_requirements" rows={4} defaultValue={p?.admission_requirements ?? ""} className={inputClass} placeholder="e.g. Upper secondary diploma + Mathematics C" />
          </Field>
          <div>
            <p className="mb-2 text-sm font-medium">Accepted education backgrounds <span className="font-normal text-muted">(leave empty = follow level)</span></p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              {EDUCATION_LEVELS.map((e) => (
                <label key={e.value} className="flex items-center gap-2">
                  <input type="checkbox" name="accepted_education_levels" value={e.value} defaultChecked={p?.accepted_education_levels.includes(e.value)} className="h-4 w-4 accent-[#102448]" />
                  {e.label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Minimum IELTS"><input name="min_ielts" type="number" step="0.5" min="0" max="9" defaultValue={p?.min_ielts ?? ""} className={inputClass} /></Field>
            <Field label="Minimum TOEFL iBT"><input name="min_toefl" type="number" defaultValue={p?.min_toefl ?? ""} className={inputClass} /></Field>
          </div>
          <Field label="Other language notes">
            <textarea name="language_requirements" rows={2} defaultValue={p?.language_requirements ?? ""} className={inputClass} placeholder="e.g. English B level, Cambridge C1 accepted" />
          </Field>
          <div>
            <p className="mb-2 text-sm font-medium">Documents students need</p>
            <div className="grid gap-2 text-[15px] sm:grid-cols-2">
              {DOCS.map(([v, l]) => (
                <label key={v} className="flex items-center gap-2">
                  <input type="checkbox" name="documents" value={v} defaultChecked={defaultDocs.includes(v)} className="h-4 w-4 accent-[#102448]" />
                  {l}
                </label>
              ))}
            </div>
          </div>
        </Group>

        <Group title="Source & publishing">
          <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
            <Field label="Official source URL"><input name="source_url" type="url" defaultValue={p?.source_url ?? ""} placeholder="https://" className={inputClass} /></Field>
            <Field label="Last checked"><input name="last_verified_at" type="date" defaultValue={p?.last_verified_at ?? new Date().toISOString().slice(0, 10)} className={inputClass} /></Field>
          </div>
          <Field label="URL slug" hint="Leave empty to generate automatically">
            <input name="slug" defaultValue={p?.slug ?? ""} className={inputClass} />
          </Field>
          <div className="flex flex-col gap-3 text-[15px]">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_published" defaultChecked={p?.is_published} className="h-4 w-4 accent-[#102448]" />
              <strong>Published</strong> <span className="text-muted">– visible to members</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_public_preview" defaultChecked={p?.is_public_preview} className="h-4 w-4 accent-[#102448]" />
              <strong>Free preview</strong> <span className="text-muted">– also shown on the public /programmes page</span>
            </label>
          </div>
        </Group>

        <FormError message={state.error} />
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save programme"}</Button>
      </form>

      {p && (
        <form action={deleteProgramme} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={p.id} />
          <Button variant="ghost" type="submit" className="!text-accent">Delete programme</Button>
        </form>
      )}
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5 rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </fieldset>
  );
}
