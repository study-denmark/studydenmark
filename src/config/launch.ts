// Pre-launch gate. While LAUNCHED is false, visitors see /coming-soon.
// Logged-in users and anyone who has opened the preview link see the full site.
// To launch: set LAUNCHED to true (or SITE_LAUNCHED=true in Vercel) and redeploy.
export const LAUNCHED = process.env.SITE_LAUNCHED === "true" || false;

// Preview link: https://www.study-denmark.com/preview?key=<PREVIEW_KEY>
// Not a security boundary – just keeps the unfinished site out of public view.
export const PREVIEW_KEY = process.env.PREVIEW_KEY || "rV5UhZ39dat17lUI";
export const PREVIEW_COOKIE = "sd_preview";

// Always reachable, also before launch (login, password reset, legal pages, APIs)
export const PUBLIC_BEFORE_LAUNCH = ["/coming-soon", "/login", "/forgot-password", "/auth", "/api", "/privacy", "/terms", "/account/password"];
