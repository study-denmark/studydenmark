import type { Metadata } from "next";
import { site } from "@/config/site";
import { Callout, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Terms of service" };

// PLACEHOLDER — must be reviewed by a lawyer before launch.
export default function TermsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="prose-guide mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold text-ink">Terms of service</h1>
        <Callout tone="warn">Placeholder text. To be completed and legally reviewed before launch.</Callout>
        <p className="mt-6">Version: {site.consentVersion}</p>
        <h2>The service</h2>
        <p>{site.name} provides information and application guidance for studying in Denmark. We are not an educational institution or public authority and cannot guarantee admission.</p>
        <h2>Membership and payment</h2>
        <p>Basic costs {site.plans.basic.amountLabel} and Premium {site.plans.premium.amountLabel} per {site.plans.basic.interval}. Both renew automatically until cancelled. Upgrading from Basic to Premium charges the difference for the rest of the membership year. [Right of withdrawal (fortrydelsesret) for digital services – wording to be added.]</p>
        <h2>Partner institutions</h2>
        <p>Some institutions pay us a referral fee. They are always labelled “Partner”.</p>
        <h2>Cancellation</h2>
        <p>You can cancel at any time from your account. Access continues until the end of the paid period.</p>
        <h2>Liability</h2>
        <p>[To be added.]</p>
      </div>
    </Container>
  );
}
