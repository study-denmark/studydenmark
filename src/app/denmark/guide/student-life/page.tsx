import type { Metadata } from "next";
import { GuideLayout } from "@/components/guide-layout";
import { officialSources } from "@/config/site";

export const metadata: Metadata = { title: "Studying in Denmark" };

export default function Page() {
  return (
    <GuideLayout
      current="/denmark/guide/student-life"
      title="What it’s like to study in Denmark"
      intro="Small classes, project work with real companies and teachers you call by their first name. Here’s what to expect – and the types of programmes you can choose between."
    >
      <h2>How teaching works</h2>
      <p>
        Danish higher education is built around <strong>group projects and independent work</strong>. You’ll
        spend less time memorising and more time solving real problems, often together with Danish companies.
        Expect to speak up in class – participation is part of how you learn.
      </p>
      <p>
        Many programmes include an <strong>internship</strong>, especially at business academies and university
        colleges. That’s one of the best ways to build a Danish network and find a job after graduation.
      </p>

      <h2>Types of programmes taught in English</h2>
      <h3>Academy Profession (AP) degree – 2 years</h3>
      <p>
        Offered by business academies (erhvervsakademier). Practical and job-focused, with an internship.
        Typical fields: marketing, IT, logistics, hospitality, multimedia design. You can continue to a top-up
        bachelor afterwards.
      </p>
      <h3>Top-up bachelor (PBA) – 1.5 years</h3>
      <p>
        For students who already hold an AP degree or similar. Takes you to a full professional bachelor’s
        degree.
      </p>
      <h3>Professional bachelor’s degree – 3.5 to 4 years</h3>
      <p>
        Offered by business academies and university colleges (professionshøjskoler). Applied, with an
        internship. Fields include engineering, business, design and more.
      </p>
      <h3>University bachelor’s degree – 3 years</h3>
      <p>
        Research-based and more theoretical. Fewer bachelor’s programmes are taught fully in English than
        master’s programmes.
      </p>
      <h3>Master’s degree (kandidat / MSc) – 2 years</h3>
      <p>
        Requires a relevant bachelor’s degree. Universities offer a large number of master’s programmes in
        English.
      </p>

      <h2>Life outside the classroom</h2>
      <ul>
        <li><strong>Everyone speaks English.</strong> You can get by without Danish, but learning some helps with jobs and friends. Free Danish classes are often available to residents.</li>
        <li><strong>Cycling is the default.</strong> Cities are compact and bike-friendly.</li>
        <li><strong>Housing is the hard part.</strong> Start looking as soon as you’re admitted, especially in Copenhagen and Aarhus.</li>
        <li><strong>You can work part-time.</strong> See <a href="/denmark/guide/cost-of-living">cost of living</a> for the rules.</li>
      </ul>

      <h2>Official source</h2>
      <p>
        The Danish government’s portal for international students is{" "}
        <a href={officialSources.studyInDenmark}>studyindenmark.dk</a>.
      </p>
    </GuideLayout>
  );
}
