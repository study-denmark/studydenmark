"use client";

import { useActionState } from "react";
import { applyViaUs, type ApplyState } from "@/app/actions/applications";
import { Button } from "@/components/ui";
import { FormError } from "@/components/auth-shell";

export function ApplyForm({ programmeId, schoolName, isPartner }: { programmeId: string; schoolName: string; isPartner: boolean }) {
  const [state, action, pending] = useActionState<ApplyState, FormData>(applyViaUs, { error: null });
  return (
    <form action={action} className="mt-6 space-y-5">
      <input type="hidden" name="programme_id" value={programmeId} />
      <label className="flex gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-5 text-[15px] leading-relaxed">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-[#14213D]" />
        <span>
          I give permission for my profile and the documents I upload to be shared with <strong>{schoolName}</strong> for
          the purpose of applying to this programme. I can withdraw this permission at any time by contacting you, and I
          can see in my account exactly which documents have been shared and when.
          {isPartner && (
            <span className="mt-2 block text-sm text-muted">
              {schoolName} is a partner school: we receive a referral fee if you enrol. You pay nothing extra.
            </span>
          )}
        </span>
      </label>
      <FormError message={state.error} />
      <Button type="submit" variant="accent" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send my request"}
      </Button>
    </form>
  );
}
