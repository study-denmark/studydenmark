import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { Container } from "@/components/ui";
import { CompanyDetails, LAST_UPDATED } from "@/components/legal";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="prose-guide mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold text-ink">Privacy policy</h1>
        <p className="mt-4 text-sm text-muted">
          Last updated {LAST_UPDATED} · Version {site.consentVersion}
        </p>

        <p>
          This policy explains what personal data we collect when you use {site.name} ({site.url.replace(/^https?:\/\//, "")}),
          why we collect it, who we share it with and what rights you have. We take your data seriously – especially
          your documents – and only share them with a school when you have asked us to.
        </p>

        <h2>1. Who is responsible for your data</h2>
        <p>The data controller is:</p>
        <CompanyDetails />
        <p>If you have questions about this policy or your data, email us at the address above.</p>

        <h2>2. What we collect</h2>
        <h3>Account</h3>
        <ul>
          <li>Name and email address</li>
          <li>Password (stored only as a secure hash – we cannot see it)</li>
          <li>Which version of our terms and this policy you accepted, and whether you want our newsletter</li>
        </ul>
        <h3>Your study profile</h3>
        <ul>
          <li>Nationality and whether you are an EU/EEA citizen</li>
          <li>Your highest education, English test and score</li>
          <li>Field of interest, preferred start date, preferred cities and budget</li>
          <li>Programmes you save</li>
        </ul>
        <h3>Documents (Premium)</h3>
        <ul>
          <li>
            Files you upload, such as your passport, diplomas, transcripts, English test result, CV, motivation letter
            and letters of recommendation
          </li>
          <li>Our review notes on each document</li>
        </ul>
        <h3>Applications (Premium)</h3>
        <ul>
          <li>Which programmes and schools you ask us to apply to, and how each application progresses</li>
          <li>Your consent to share documents with each school, and a log of every document we have shared</li>
        </ul>
        <h3>Payments</h3>
        <ul>
          <li>
            Your membership plan, payment status, amounts and invoice dates. Card details are entered directly with our
            payment provider Stripe – we never see or store your card number.
          </li>
        </ul>
        <h3>Technical data</h3>
        <ul>
          <li>
            A login cookie that keeps you signed in, and a security check (Cloudflare Turnstile) on sign-up and login
            that protects against bots
          </li>
          <li>Server logs with IP address and browser type, kept by our hosting providers for security and troubleshooting</li>
        </ul>

        <h2>3. Why we use your data, and our legal basis</h2>
        <ul>
          <li>
            <strong>To provide the service you signed up for</strong> – your account, programme matches, document
            checklist, document review and help applying. Legal basis: performance of a contract (GDPR art. 6(1)(b)).
          </li>
          <li>
            <strong>To send your documents to a school.</strong> We only do this after you have asked us to apply to that
            specific school and given your consent. You can withdraw consent at any time; this does not affect documents
            already sent. Legal basis: consent (art. 6(1)(a)).
          </li>
          <li>
            <strong>To take payment and keep accounting records</strong> as required by the Danish Bookkeeping Act.
            Legal basis: contract and legal obligation (art. 6(1)(b) and (c)).
          </li>
          <li>
            <strong>To keep the service secure</strong> – preventing bots, fraud and misuse. Legal basis: our legitimate
            interest in protecting the service and our users (art. 6(1)(f)).
          </li>
          <li>
            <strong>To send you our newsletter</strong>, only if you ticked the box. You can unsubscribe at any time.
            Legal basis: consent (art. 6(1)(a)).
          </li>
        </ul>
        <p>
          Programme matches are calculated automatically from your profile. They are recommendations only and never
          decide anything about you – admission decisions are always made by the schools.
        </p>

        <h2>4. Who we share your data with</h2>
        <h3>Schools you choose</h3>
        <p>
          When you ask us to apply to a programme, we send your approved documents and a short applicant summary to that
          school. The school then processes your data as an independent data controller under its own privacy policy.
          You can see every share in your account under Applications.
        </p>
        <h3>Service providers (data processors)</h3>
        <p>We use the following providers, who only process data on our instructions and under a data processing agreement:</p>
        <ul>
          <li><strong>Supabase</strong> – database, file storage and login. Data is stored in the EU (Stockholm, Sweden).</li>
          <li><strong>Vercel</strong> – hosting of the website. Servers in the EU (Stockholm), with a global network for delivering pages.</li>
          <li><strong>Cloudflare</strong> – bot protection (Turnstile) on sign-up and login.</li>
          <li>
            <strong>Stripe</strong> – payments. Stripe is also an independent controller for some data it needs for fraud
            prevention and legal requirements.
          </li>
        </ul>
        <p>
          Some of these providers are based in the USA and may access data from there. Such transfers are covered by the
          EU–US Data Privacy Framework, which all of them are certified under, and/or the EU Commission’s Standard
          Contractual Clauses.
        </p>
        <h3>Our team</h3>
        <p>
          A small team, including our partner who helps students apply, can access your profile and documents to
          review them and prepare applications. Everyone with access is bound by confidentiality.
        </p>
        <p>We never sell your data, and we do not use it for advertising.</p>

        <h2>5. How long we keep your data</h2>
        <ul>
          <li>
            <strong>Account and profile:</strong> as long as you have an account. If you have had no active membership
            and haven’t logged in for 24 months, we delete your account automatically.
          </li>
          <li>
            <strong>Uploaded documents:</strong> until you delete them, and automatically no later than 12 months after
            your membership ends.
          </li>
          <li>
            <strong>Applications, consents and the share log:</strong> as long as you have an account, so we can document
            what was shared and with your consent.
          </li>
          <li>
            <strong>Payment and accounting records:</strong> 5 years from the end of the financial year, as required by
            the Danish Bookkeeping Act.
          </li>
          <li><strong>Server logs:</strong> a short period, normally no more than 30 days.</li>
        </ul>
        <p>
          When you delete your account, we delete your profile, documents and applications right away. Payment records
          are kept, but no longer linked to your account.
        </p>

        <h2>6. Your rights</h2>
        <p>Under the GDPR you have the right to:</p>
        <ul>
          <li>get access to the data we hold about you, and a copy of it</li>
          <li>have incorrect data corrected</li>
          <li>have your data deleted</li>
          <li>restrict or object to our processing</li>
          <li>receive your data in a machine-readable format (data portability)</li>
          <li>withdraw any consent you have given, at any time</li>
        </ul>
        <p>
          You can download all your data and delete your account yourself from your{" "}
          <Link href="/account">account page</Link>. For anything else, email us at{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> and we will reply within one month.
        </p>
        <p>
          You can also complain to the Danish Data Protection Agency: Datatilsynet, Carl Jacobsens Vej 35, 2500 Valby,
          Denmark – <a href="https://www.datatilsynet.dk">datatilsynet.dk</a>.
        </p>

        <h2>7. Cookies</h2>
        <p>
          We only use cookies that are strictly necessary for the site to work: a cookie that keeps you logged in, and
          the security check on sign-up and login. We do not use analytics, tracking or advertising cookies, so we don’t
          ask for cookie consent.
        </p>

        <h2>8. Security</h2>
        <p>
          Documents are stored in a private, encrypted storage area. Only you and our review team can open them, and
          only through short-lived secure links. All traffic to the site is encrypted (HTTPS), and access to your data is
          limited by strict access rules in our database. If a data breach ever puts your rights at risk, we will tell
          you and the Danish Data Protection Agency as the law requires.
        </p>

        <h2>9. Changes to this policy</h2>
        <p>
          If we make important changes, we will tell you by email or when you log in. The version and date at the top
          always show which policy applies.
        </p>
      </div>
    </Container>
  );
}
