import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/plans";

export type Subscription = {
  status: string;
  plan: Plan;
  stripe_subscription_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

const isLive = (s: Subscription) =>
  ["active", "trialing"].includes(s.status) &&
  (!s.current_period_end || new Date(s.current_period_end) > new Date());

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { supabase, user: null, profile: null, subscription: null, isActive: false, plan: null, isPremium: false };

  const [{ data: profile }, { data: subs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("status, plan, stripe_subscription_id, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
      .order("current_period_end", { ascending: false, nullsFirst: false }),
  ]);

  const all = (subs as Subscription[] | null) ?? [];
  const live = all.filter(isLive);
  // Premium wins if the member has both (e.g. during an upgrade)
  const subscription = live.find((s) => s.plan === "premium") ?? live[0] ?? all[0] ?? null;
  const isActive = live.length > 0;
  const plan: Plan | null = isActive ? subscription!.plan : null;
  const isAdmin = profile?.role === "admin";

  return { supabase, user, profile, subscription, isActive, plan, isPremium: plan === "premium" || isAdmin };
}

/** For pages behind the paywall: must be logged in AND have an active membership (any plan). */
export async function requireSubscriber() {
  const session = await getSession();
  if (!session.user) redirect("/login");
  if (!session.isActive && session.profile?.role !== "admin") redirect("/subscribe");
  return session;
}

/** For Premium-only pages (documents, applying via us). Basic members are sent to the upgrade page. */
export async function requirePremium() {
  const session = await requireSubscriber();
  if (!session.isPremium) redirect("/upgrade");
  return session;
}
