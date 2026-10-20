import { ButtonLink } from "@/components/ui";
import { CountryNotify } from "@/components/country-notify";
import { Flag } from "@/components/flags";
import { countries, getCountry } from "@/config/countries";

// Right-hand column of the home hero. To use a photo instead, replace this component's markup.
export function HeroSide() {
  const denmark = getCountry("denmark");
  const comingSoon = countries.filter((c) => c.status === "coming-soon");

  return (
    <div id="countries" aria-labelledby="hero-countries" className="scroll-mt-24">
      <p id="hero-countries" className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-sea">
        Choose your country
      </p>

      <div className="rounded-[var(--radius-card)] border-2 border-ink bg-surface p-5 shadow-[0_30px_60px_-40px_rgba(16,36,72,0.45)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Flag id={denmark.id} large />
            <h2 className="text-2xl font-semibold">{denmark.name}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-sea-soft px-3 py-1 text-xs font-semibold text-sea">Available now</span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          English-taught programmes, requirements and deadlines in one place.
        </p>
        <ButtonLink href={denmark.href!} variant="accent" className="mt-5 min-h-11 w-full">
          Start with {denmark.name}
        </ButtonLink>
      </div>

      <ul className="mt-3 space-y-2">
        {comingSoon.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-dashed border-ink/25 bg-paper px-4 py-2.5"
          >
            <Flag id={c.id} />
            <span className="font-medium text-ink-soft">{c.name}</span>
            <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">
              Coming soon
            </span>
            <CountryNotify country={c.name} source={c.waitlistSource!} compact />
          </li>
        ))}
      </ul>
    </div>
  );
}
