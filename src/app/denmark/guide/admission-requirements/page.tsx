import type { Metadata } from "next";
import { GuideLayout } from "@/components/guide-layout";
import { officialSources } from "@/config/site";

export const metadata: Metadata = { title: "Admission requirements" };

export default function Page() {
  return (
    <GuideLayout
      current="/denmark/guide/admission-requirements"
      title="Admission requirements"
      intro="Every programme has its own rules, but they follow the same structure. Here’s what schools will look at."
    >
      <h2>1. Your previous education</h2>
      <h3>For AP, professional bachelor and university bachelor programmes</h3>
      <p>
        You need an upper secondary (high school) diploma that is comparable to the Danish{" "}
        <em>gymnasium</em>. Many international diplomas qualify, such as the IB Diploma, European
        Baccalaureate and most national school-leaving exams. Some countries’ diplomas need an extra year of
        university study before they count.
      </p>
      <p>
        On top of that, many programmes have <strong>specific requirements</strong> – for example a certain
        level of maths or English.
      </p>
      <h3>For top-up bachelor programmes</h3>
      <p>An Academy Profession degree or similar in a related field.</p>
      <h3>For master’s programmes</h3>
      <p>
        A bachelor’s degree in a relevant field. Universities assess this course by course, so two students
        with the same degree title can get different answers.
      </p>

      <h2>2. English</h2>
      <p>
        You must document English at the level of Danish “English B” or “English A”. Most schools accept tests
        like IELTS Academic, TOEFL iBT, Cambridge and PTE. As a guide:
      </p>
      <ul>
        <li><strong>Business academies:</strong> often IELTS 6.0–6.5</li>
        <li><strong>Universities:</strong> often IELTS 6.5–7.0</li>
      </ul>
      <p>
        You may be exempt if you’re a native speaker or completed your education in English in certain
        countries. Note that if you need a residence permit, some schools want your test result by{" "}
        <strong>15 March</strong>.
      </p>

      <h2>3. Documents you will usually need</h2>
      <ul>
        <li>Passport</li>
        <li>Upper secondary diploma (and bachelor’s diploma for master’s)</li>
        <li>Transcript of grades</li>
        <li>English test result</li>
        <li>CV and motivation letter (for some programmes)</li>
        <li>Certified translations if your documents aren’t in English or a Scandinavian language</li>
      </ul>

      <h2>Where you apply</h2>
      <p>
        AP, professional bachelor and university bachelor programmes: through{" "}
        <a href={officialSources.optagelse}>optagelse.dk</a>. Master’s programmes: usually directly through
        the university’s own application portal.
      </p>
    </GuideLayout>
  );
}
