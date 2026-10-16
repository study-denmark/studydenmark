"use client";

import { useActionState } from "react";
import { deleteInstitution, saveInstitution, type AdminState } from "@/app/actions/admin";
import type { Institution } from "@/lib/types";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/auth-shell";

export function InstitutionForm({ institution: i }: { institution: Institution | null }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveInstitution, { error: null });

  return (
    <>
      <form action={action} className="mt-8 space-y-5">
        {i && <input type="hidden" name="id" value={i.id} />}
        <Field label="Name *">
          <input name="name" required defaultValue={i?.name} className={inputClass} placeholder="e.g. Business Academy SouthWest" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Type">
            <select name="type" defaultValue={i?.type ?? "business_academy"} className={inputClass}>
              <option value="business_academy">Business academy (erhvervsakademi)</option>
              <option value="university_college">University college (professionshøjskole)</option>
              <option value="university">University</option>
              <option value="private_school">Private school</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="City">
            <input name="city" defaultValue={i?.city ?? ""} className={inputClass} />
          </Field>
        </div>
        <Field label="Website">
          <input name="website" type="url" defaultValue={i?.website ?? ""} className={inputClass} placeholder="https://" />
        </Field>
        <Field label="Short description">
          <textarea name="description" rows={4} defaultValue={i?.description ?? ""} className={inputClass} />
        </Field>
        <Field label="URL slug" hint="Leave empty to generate from the name">
          <input name="slug" defaultValue={i?.slug ?? ""} className={inputClass} />
        </Field>
        <label className="flex items-start gap-3 rounded-xl border border-accent/25 bg-accent-soft p-4 text-[15px]">
          <input type="checkbox" name="is_partner" defaultChecked={i?.is_partner} className="mt-1 h-4 w-4 accent-[#C8102E]" />
          <span>
            <strong>Partner school</strong>
            <span className="block text-sm text-ink-soft">
              We have a referral agreement. The school is boosted in matches and always shown with a “Partner” label.
            </span>
          </span>
        </label>
        <FormError message={state.error} />
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save institution"}</Button>
      </form>
      {i && (
        <form action={deleteInstitution} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={i.id} />
          <p className="text-sm text-muted">Deleting an institution also deletes all its programmes.</p>
          <Button variant="ghost" type="submit" className="mt-3 !text-accent">Delete institution</Button>
        </form>
      )}
    </>
  );
}
