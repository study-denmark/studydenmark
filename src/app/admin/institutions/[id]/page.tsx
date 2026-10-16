import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Institution } from "@/lib/types";
import { savePartnerAgreement } from "@/app/actions/admin-ops";
import { Button, Callout, Card, Field, inputClass } from "@/components/ui";
import { InstitutionForm } from "./form";

export default async function EditInstitution({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  let institution: Institution | null = null;
  let deal: Record<string, string | number | null> | null = null;
  if (id !== "new") {
    const supabase = await createClient();
    const { data } = await supabase.from("institutions").select("*").eq("id", id).maybeSingle<Institution>();
    if (!data) notFound();
    institution = data;
    const { data: d } = await supabase.from("partner_agreements").select("*").eq("institution_id", id).maybeSingle();
    deal = d;
  }
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold">{institution ? institution.name : "New institution"}</h1>
      {saved === "agreement" && <div className="mt-4"><Callout>Partner agreement saved.</Callout></div>}
      <InstitutionForm institution={institution} />

      {institution?.is_partner && (
        <Card className="mt-10">
          <h2 className="text-lg font-semibold">Partner agreement</h2>
          <p className="mt-1 text-sm text-ink-soft">Admin-only. Used to fill in expected commission when a student is admitted.</p>
          <form action={savePartnerAgreement} className="mt-5 space-y-4">
            <input type="hidden" name="institution_id" value={institution.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Commission per student (€)" hint="Leave empty to remove the agreement">
                <input name="commission_amount_eur" type="number" min={0} defaultValue={deal?.commission_amount_eur ?? ""} className={inputClass} />
              </Field>
              <Field label="Agreement signed">
                <input name="agreement_signed_at" type="date" defaultValue={(deal?.agreement_signed_at as string) ?? ""} className={inputClass} />
              </Field>
              <Field label="Contact name">
                <input name="contact_name" defaultValue={(deal?.contact_name as string) ?? ""} className={inputClass} />
              </Field>
              <Field label="Contact email">
                <input name="contact_email" type="email" defaultValue={(deal?.contact_email as string) ?? ""} className={inputClass} />
              </Field>
            </div>
            <Field label="Payment terms" hint="e.g. Paid after student is enrolled past 1 October census">
              <input name="payment_terms" defaultValue={(deal?.payment_terms as string) ?? ""} className={inputClass} />
            </Field>
            <Field label="Notes">
              <textarea name="notes" rows={3} defaultValue={(deal?.notes as string) ?? ""} className={inputClass} />
            </Field>
            <Button type="submit">Save agreement</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
