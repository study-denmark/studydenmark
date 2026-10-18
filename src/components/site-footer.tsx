import Link from "next/link";
import { guideNav, officialSources, site } from "@/config/site";
import { Container } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold">{site.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Independent guidance for international students who want to study in Denmark. We are not a
            government body.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Guide</p>
          <ul className="space-y-2 text-sm text-muted">
            {guideNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Official sources</p>
          <ul className="space-y-2 text-sm text-muted">
            <li><a className="hover:text-ink" href={officialSources.studyInDenmark}>Study in Denmark</a></li>
            <li><a className="hover:text-ink" href={officialSources.optagelse}>Optagelse.dk (applications)</a></li>
            <li><a className="hover:text-ink" href={officialSources.nyIDanmark}>New to Denmark (SIRI)</a></li>
            <li><a className="hover:text-ink" href={officialSources.ics}>International Citizen Service</a></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Company</p>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href="/pricing">Pricing</Link></li>
            <li><Link className="hover:text-ink" href="/faq">FAQ</Link></li>
            <li><Link className="hover:text-ink" href="/privacy">Privacy policy</Link></li>
            <li><Link className="hover:text-ink" href="/terms">Terms of service</Link></li>
            <li><a className="hover:text-ink" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></li>
          </ul>
        </div>
      </Container>
      <Container className="border-t border-line py-6 text-xs text-muted">
        © {new Date().getFullYear()} {site.company.name} · {site.company.address} ·{" "}
        {site.company.cvr ? `CVR ${site.company.cvr}` : "CVR registration pending"}. Partner institutions are always labelled “Partner”.
      </Container>
    </footer>
  );
}
