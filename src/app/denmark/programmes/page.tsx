import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink, Card, PartnerBadge } from "@/components/ui";
import { CountryPage } from "@/components/country-layout";
import { levelLabels } from "@/lib/labels";

export const metadata: Metadata = { title: "Programmes taught in English" };

const types = [
  { level: "academy_profession", years: "2 years", who: "After high school", desc: "Practical, job-focused, with an internship. Business academies." },
  { level: "top_up", years: "1.5 years", who: "After an AP degree", desc: "Turns your AP degree into a full bachelor’s." },
  { level: "professional_bachelor", years: "3.5–4 years", who: "After high school", desc: "Applied bachelor’s with internship. Academies and university colleges." },
  { level: "bachelor", years: "3 years", who: "After high school", desc: "Research-based university bachelor’s." },
  { level: "master", years: "2 years", who: "After a bachelor’s", desc: "Specialised university degree (MSc/MA)." },
] as const;

type PreviewProgramme = {
  id: string;
  title: string;
  level: keyof typeof levelLabels;
  field: string;
  city: string;
  duration_months: number | null;
  institutions: { name: string; is_partner: boolean } | null;
};

export default async function ProgrammesPage() {
  const supabase = await createClient();
  const [{ data: previews }, { data: total }] = await Promise.all([
    supabase
      .from("programmes")
      .select("id, title, level, field, city, duration_months, institutions(name, is_partner)")
      .eq("is_public_preview", true)
      .eq("is_published", true)
      .order("title")
      .limit(6)
      .returns<PreviewProgramme[]>(),
    supabase.rpc("count_published_programmes"),
  ]);

  return (
    <CountryPage
      eyebrow="Programmes"
      title="English-taught programmes in Denmark"
      intro={
        <p>
          Business academies and universities across Denmark teach full degrees in English. Here are the five
          types you can choose between.
          {typeof total === "number" && total > 0 && (
            <> Members get access to all <strong className="text-ink">{total}</strong> programmes in our database, matched to their profile.</>
          )}
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((t) => (
          <Card key={t.level}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold">{levelLabels[t.level]}</h2>
              <span className="shrink-0 text-sm text-muted">{t.years}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-sea">{t.who}</p>
            <p className="mt-3 text-[15px] text-ink-soft">{t.desc}</p>
          </Card>
        ))}
      </div>

      {previews && previews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Example programmes</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {previews.map((p) => (
              <Card key={p.id}>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>{levelLabels[p.level]}</span>
                  <span aria-hidden>·</span>
                  <span>{p.city}</span>
                  {p.duration_months && (<><span aria-hidden>·</span><span>{p.duration_months / 12} years</span></>)}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
                  {p.institutions?.name}
                  {p.institutions?.is_partner && <PartnerBadge />}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16 grid items-center gap-6 rounded-[var(--radius-card)] bg-ink p-8 text-white sm:grid-cols-[1fr_auto] sm:p-10">
        <div>
          <h2 className="text-2xl font-semibold">See every programme you qualify for</h2>
          <p className="mt-2 text-white/75">
            Requirements, tuition, deadlines and language scores – filtered to your profile.
          </p>
        </div>
        <ButtonLink href="/denmark/eligibility" className="bg-white !text-ink hover:bg-paper">
          Check your eligibility
        </ButtonLink>
      </div>
    </CountryPage>
  );
}
