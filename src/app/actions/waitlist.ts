"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { site } from "@/config/site";

export type WaitlistState = { status: "idle" | "ok" | "error"; message?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Only these values are stored in waitlist.source; anything else falls back to the launch list
const SOURCES = new Set([
  "coming-soon",
  "country:sweden",
  "country:norway",
  "country:finland",
  "country:netherlands",
]);

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Honeypot: real people never fill this hidden field
  if (String(formData.get("company") ?? "") !== "") return { status: "ok" };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const requested = String(formData.get("source") ?? "");
  const source = SOURCES.has(requested) ? requested : "coming-soon";

  const admin = createAdminClient();
  const { error } = await admin.from("waitlist").insert({
    email,
    consent_version: site.consentVersion,
    source,
  });
  // 23505 = already on the list; treat as success so we don't reveal who signed up
  if (error && error.code !== "23505") {
    console.error("[waitlist]", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  return { status: "ok" };
}
