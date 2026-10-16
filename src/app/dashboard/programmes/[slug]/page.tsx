import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSubscriber } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { matchProgramme, tierLabels } from "@/lib/matching";
import { levelLabels } from "@/lib/labels";
import { EDUCATION_LEVELS } from "@/lib/constants";
import { PROGRAMME_SELECT, type ProgrammeWithInstitution, type StudentProfile } from "@/lib/types";
import { CheckIcon, SaveButton } from "@/components/programme-card";
import { Card, PartnerBadge } from "@/components/ui";

const docLabels: Record<string, string> = {
  passport: "Passport",
  diploma: "Diploma(s)",
  transcript: "Transcript of grades",
  language_test: "English test result",
  cv: "CV",
  motivation_letter: "Motivation letter",
  recommendation: "Letter of recommendation",
  other: "Other document",
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Not listed";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("programmes").select("title").eq("slug", slug).maybeSingle();
  return { title: data?.title ?? "Programme" };
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, user, profile } = await requireSubscriber();

  const { data: p } = await supabase
    .from("programmes")
    .select(PROGRAMME_SELECT)
    .eq("slug", slug)
    .maybeSingle<ProgrammeWithInstitution>();
  if (!p) notFound();

  const [{ data: docs }, { data: saved }, { data: application }] = await Promise.all([
    supabase.from("programme_required_documents").select("document_type, note").eq("programme_id", p.id),
    supabase.from("saved_programmes").select("programme_id").eq("user_id", user!.id).eq("programme_id", p.id),
    supabase.from("applications").select("id, stage").eq("user_id", user!.id).eq("programme_id", p.id).maybeSingle(),
  ]);

  const s = profile as StudentProfile;
  const m = matchProgramme(p, s);
  const partner = !!p.institutions?.is_partner;
  const isEu = !!s.is_eu_eea;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <Link href="/dashboard/programmes" className="text-sm text-muted hover:text-ink">← All programmes</Link>
        {!p.is_published && (
          <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm">Draft – only admins can see this programme.</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>{levelLabels[p.level]}</span>
          <span aria-hidden>·</span>
          <span>{p.field}</span>
          <span aria-hidden>·</span>
          <span>{p.city}</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{p.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-lg text-ink-soft">{p.institutions?.name}</span>
          {partner && <PartnerBadge />}
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact k="Duration" v={p.duration_months ? `${+(p.duration_months / 12).toFixed(1)} years` : "—"} />
          <Fact k="ECTS" v={p.ects ? String(p.ects) : "—"} />
          <Fact k="Intake" v={p.intake ?? "—"} />
          <Fact k="Language" v={p.teaching_language} />
        </dl>

        {p.description && (
          <Section title="About the programme">
            <p className="whitespace-pre-line">{p.description}</p>
          </Section>
        )}

        <Section title="Admission requirements">
          {p.admission_requirements ? (
            <p className="whitespace-pre-line">{p.admission_requirements}</p>
          ) : (
            <p>Not listed yet – see the official programme page.</p>
          )}
          {p.accepted_education_levels.length > 0 && (
            <p className="mt-3 text-sm">
              <strong className="text-ink">Accepted backgrounds: </strong>
              {p.accepted_education_levels.map((l) => EDUCATION_LEVELS.find((e) => e.value === l)?.label).join(", ")}
            </p>
          )}
        </Section>

        <Section title="English requirement">
          <p>
            {p.min_ielts != null && <>IELTS Academic {Number(p.min_ielts).toFixed(1)}</>}
            {p.min_ielts != null && p.min_toefl != null && " or "}
            {p.min_toefl != null && <>TOEFL iBT {p.min_toefl}</>}
            {p.min_ielts == null && p.min_toefl == null && "Not listed yet."}
          </p>
          {p.language_requirements && <p className="mt-2 whitespace-pre-line">{p.language_requirements}</p>}
        </Section>

        <Section title="Tuition and deadlines">
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-paper text-sm">
                <tr>
                  <th className="px-4 py-2.5 font-semibold"></th>
                  <th className={`px-4 py-2.5 font-semibold ${isEu ? "text-sea" : ""}`}>EU/EEA</th>
                  <th className={`px-4 py-2.5 font-semibold ${!isEu ? "text-sea" : ""}`}>Non-EU</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <td className="px-4 py-3 text-muted">Tuition / year</td>
                  <td className="px-4 py-3">{euro(p.tuition_eu_eur_per_year ?? 0)}</td>
                  <td className="px-4 py-3">{euro(p.tuition_non_eu_eur_per_year)}</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-4 py-3 text-muted">Deadline</td>
                  <td className="px-4 py-3">{fmtDate(p.application_deadline_eu)}</td>
                  <td className="px-4 py-3">{fmtDate(p.application_deadline_non_eu)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">Your column is highlighted.</p>
        </Section>

        {docs && docs.length > 0 && (
          <Section title="Documents you’ll need">
            <ul className="space-y-2">
              {docs.map((d) => (
                <li key={d.document_type} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    {docLabels[d.document_type] ?? d.document_type}
                    {d.note && <span className="text-muted"> – {d.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <p className="mt-10 border-t border-line pt-5 text-xs text-muted">
          {p.source_url && (
            <>
              Source: <a href={p.source_url} className="underline" target="_blank" rel="noopener noreferrer">official programme page</a>.{" "}
            </>
          )}
          {p.last_verified_at && <>Last checked {fmtDate(p.last_verified_at)}. </>}
          Always confirm requirements with the institution before applying.
          {partner && " This is a partner school – we receive a referral fee if you enrol. It doesn’t affect the information shown or what you pay."}
        </p>
      </div>

      <aside className="lg:pt-10">
        <Card className="lg:sticky lg:top-24">
          {!s.onboarding_completed_at ? (
            <Link href="/onboarding" className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-ink underline">
              Complete your profile to see your match
            </Link>
          ) : m.eligibleLevel ? (
            <span className="rounded-full bg-sea-soft px-2.5 py-1 text-xs font-semibold text-sea">{tierLabels[m.tier]}</span>
          ) : (
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
              Not at your education level
            </span>
          )}
          <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {m.tuition === 0 ? "Free" : m.tuition != null ? `€${m.tuition.toLocaleString("en")}` : "—"}
            {m.tuition ? <span className="text-base font-normal text-muted"> / year</span> : null}
          </p>
          <p className="text-sm text-muted">for {isEu ? "EU/EEA" : "non-EU"} students</p>

          <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
            {m.checks.map((c) => (
              <li key={c.label} className="flex gap-2">
                <CheckIcon ok={c.ok} />
                <span>{c.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            {application ? (
              <Link href="/dashboard/applications" className="rounded-full bg-sea-soft px-5 py-3 text-center font-medium text-sea">
                ✓ Application in progress – view status
              </Link>
            ) : p.is_published ? (
              <Link href={`/dashboard/apply/${p.slug}`} className="rounded-full bg-accent px-5 py-3 text-center font-medium text-white hover:bg-[#a50d26]">
                Apply with our help
              </Link>
            ) : null}
            <SaveButton programmeId={p.id} saved={!!saved?.length} withLabel />
            <p className="text-xs text-muted">Included in your membership. We check your documents and send the application for you.</p>
          </div>
        </Card>
      </aside>
    </div>
  );
}

const euro = (v: number | null) => (v === 0 ? "Free" : v != null ? `€${v.toLocaleString("en")}` : "—");

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <dt className="text-xs text-muted">{k}</dt>
      <dd className="mt-0.5 font-medium">{v}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}
