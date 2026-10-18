import { site } from "@/config/site";

export const LAST_UPDATED = "18 October 2026";

export function CompanyDetails() {
  const c = site.company;
  return (
    <p>
      <strong>{c.name}</strong>
      <br />
      {c.address}
      <br />
      {c.cvr ? `CVR no. ${c.cvr}` : "CVR no.: registration pending"}
      <br />
      Email: <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
    </p>
  );
}
