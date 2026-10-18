import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LAUNCHED, PREVIEW_COOKIE, PREVIEW_KEY, PUBLIC_BEFORE_LAUNCH } from "@/config/launch";

const PROTECTED_PREFIXES = ["/dashboard", "/account", "/subscribe", "/checkout", "/onboarding", "/admin", "/upgrade"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not put code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // ---------- Pre-launch gate ----------
  if (!LAUNCHED) {
    if (path === "/preview") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      const ok = request.nextUrl.searchParams.get("key") === PREVIEW_KEY;
      const res = NextResponse.redirect(url);
      if (ok) {
        res.cookies.set(PREVIEW_COOKIE, "1", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 90 });
      }
      return res;
    }
    const isPublic = PUBLIC_BEFORE_LAUNCH.some((p) => path === p || path.startsWith(p + "/"));
    const hasPreview = request.cookies.get(PREVIEW_COOKIE)?.value === "1";
    if (!isPublic && !user && !hasPreview) {
      const url = request.nextUrl.clone();
      url.pathname = "/coming-soon";
      url.search = "";
      const res = NextResponse.rewrite(url);
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
