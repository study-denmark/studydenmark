import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { Container } from "@/components/ui";
import { CompanyDetails, LAST_UPDATED } from "@/components/legal";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  const { basic, premium } = site.plans;
  return (
    <Container className="py-12 sm:py-16">
      <div className="prose-guide mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold text-ink">Terms of service</h1>
        <p className="mt-4 text-sm text-muted">
          Last updated {LAST_UPDATED} · Version {site.consentVersion}
        </p>

        <p>
          These terms apply when you create an account or buy a membership on {site.name}. Please read them before you
          sign up. Our <Link href="/privacy">privacy policy</Link> explains how we handle your data.
        </p>

        <h2>1. Who we are</h2>
        <CompanyDetails />

        <h2>2. What we offer</h2>
        <p>
          {site.name} helps international students find out what they can study in Denmark and apply. We offer two
          yearly memberships:
        </p>
        <ul>
          <li>
            <strong>{basic.name}</strong> ({basic.amountLabel} per {basic.interval}): access to our database of
            English-taught programmes, personal matches, entry requirements, tuition, deadlines and the documents each
            programme asks for.
          </li>
          <li>
            <strong>{premium.name}</strong> ({premium.amountLabel} per {premium.interval}): everything in Basic, plus a
            personal document checklist, secure upload, a check of your documents and help sending applications to the
            schools you choose.
          </li>
        </ul>
        <p>
          We are an independent company, not a school or a public authority. Our information is based on official
          sources and the schools’ own websites. We work to keep it correct and up to date, but requirements, fees and
          deadlines can change – always check the school’s own website before you apply.
        </p>

        <h2>3. No guarantee of admission</h2>
        <p>
          Schools decide who is admitted, and the Danish authorities decide on residence permits. We cannot guarantee
          admission, a study place, a residence permit or a scholarship. When we check your documents, we check that
          they are complete and match what the programme asks for – we do not verify that they are genuine.
        </p>

        <h2>4. Partner schools</h2>
        <p>
          Some schools pay us a referral fee when a student we helped enrols. These schools are always marked
          “Partner”. This never changes the price you pay or the requirements we show, and we show you every programme
          you qualify for – not only partner schools.
        </p>

        <h2>5. Your account</h2>
        <ul>
          <li>You must give correct information about yourself and keep your login details private.</li>
          <li>If you are under 18, a parent or guardian must agree to your purchase.</li>
          <li>
            You may only upload your own, genuine documents. We will close the account of anyone who uploads forged or
            altered documents, and we will not send applications for them.
          </li>
          <li>The account is personal and may not be shared or resold.</li>
        </ul>

        <h2>6. Prices and payment</h2>
        <p>
          Prices are shown in euro (EUR) and include any VAT that applies. Payment is taken by card or another method
          offered at checkout through our payment provider, Stripe, when you buy the membership.
        </p>

        <h2>7. Renewal and cancellation</h2>
        <ul>
          <li>Your membership runs for one year and renews automatically at the then-current price until you cancel.</li>
          <li>We send you an email reminder before your membership renews.</li>
          <li>
            You can cancel at any time from your <Link href="/account">account page</Link>. You keep access until the end
            of the year you have paid for, and the membership will not renew. Apart from the right of withdrawal below,
            we do not refund the remaining part of a year.
          </li>
          <li>
            <strong>Upgrading from Basic to Premium:</strong> you pay only the difference for the rest of your current
            membership year, charged straight away. After that, Premium renews at the Premium price.
          </li>
        </ul>

        <h2>8. Right of withdrawal (14 days)</h2>
        <p>
          You can withdraw from your purchase within 14 days of buying it, without giving a reason. To do so, email us at{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> with a clear statement that you want to
          withdraw – for example: <em>“I withdraw from my purchase of [plan] bought on [date]. Name, email.”</em> It is
          enough that you send it before the 14 days have passed.
        </p>
        <p>
          We refund the full amount within 14 days of receiving your message, using the same payment method you used.
          If you have asked us to start our Premium services and we have already sent an application to a school on your
          behalf within the 14 days, we may deduct a proportionate amount for the work already done.
        </p>

        <h2>9. Our liability</h2>
        <p>
          We are liable for loss caused by our own errors under the general rules of Danish law. We are not liable for
          decisions made by schools or authorities, for changes to requirements or deadlines that schools make, or for
          indirect losses such as lost earnings. Unless we acted with intent or gross negligence, our total liability is
          limited to the amount you have paid us in the last 12 months. This does not limit any rights you have under
          mandatory consumer law.
        </p>

        <h2>10. If we close an account</h2>
        <p>
          We may suspend or close an account that breaks these terms, for example by uploading forged documents or
          misusing the service. If we close your account without you having broken the terms, we refund the unused part
          of your membership.
        </p>

        <h2>11. Changes to the terms and prices</h2>
        <p>
          We may change these terms or our prices. We will tell you by email at least 30 days before a change affects
          your membership. If you don’t accept the change, you can cancel before it takes effect.
        </p>

        <h2>12. Complaints</h2>
        <p>
          If you are not happy, contact us first at{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> – we will do our best to find a solution.
        </p>
        <p>
          If we cannot agree, you can complain to the Danish Consumer Complaints Board (Forbrugerklagenævnet), Nævnenes
          Hus, Toldboden 2, 8800 Viborg, Denmark – <a href="https://www.naevneneshus.dk">naevneneshus.dk</a>. If you live
          in another EU country, you can also get help from the European Consumer Centre in your country.
        </p>

        <h2>13. Law and jurisdiction</h2>
        <p>
          These terms are governed by Danish law. Disputes are settled by the Danish courts. If you are a consumer living
          in another country, you keep the protection given to you by the mandatory rules of that country.
        </p>
      </div>
    </Container>
  );
}
