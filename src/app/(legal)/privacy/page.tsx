import type { Metadata } from "next";
import { site } from "@/config/site";
import { Callout, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy policy" };

// PLACEHOLDER — must be reviewed by a lawyer before launch.
export default function PrivacyPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="prose-guide mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold text-ink">Privacy policy</h1>
        <Callout tone="warn">Placeholder text. To be completed and legally reviewed before launch.</Callout>
        <p className="mt-6">Version: {site.consentVersion}</p>
        <h2>Who we are</h2>
        <p>[Company name ApS], CVR [number], [address], Denmark. Contact: {site.contactEmail}.</p>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: name, email, password (hashed)</li>
          <li>Profile: nationality, education, English test score, study preferences, budget</li>
          <li>Documents you upload: passport, diplomas, transcripts, test results, CV, motivation letter</li>
          <li>Payment information is handled by Stripe – we never see your card number</li>
        </ul>
        <h2>Why we use it, and our legal basis</h2>
        <ul>
          <li>To provide the service you paid for (contract, GDPR art. 6(1)(b))</li>
          <li>To share documents with a school – only with your explicit consent per school (art. 6(1)(a))</li>
          <li>To keep bookkeeping records (legal obligation, art. 6(1)(c))</li>
        </ul>
        <h2>Who we share with</h2>
        <p>[List processors: Supabase (hosting, EU region), Stripe (payments), email provider.] Schools only receive your documents after you ask us to apply on your behalf. Every share is logged and visible to you.</p>
        <h2>How long we keep it</h2>
        <p>[Retention periods.]</p>
        <h2>Your rights</h2>
        <p>You can access, download and delete your data from your account page, and you can complain to the Danish Data Protection Agency (Datatilsynet).</p>
      </div>
    </Container>
  );
}
