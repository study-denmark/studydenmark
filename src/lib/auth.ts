import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Subscription = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, subscription: null, isActive: false };

  const [{ data: profile }, { data: subs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
      .order("current_period_end", { ascending: false, nullsFirst: false })
      .limit(1),
  ]);

  const subscription = (subs?.[0] as Subscription | undefined) ?? null;
  const isActive =
    !!subscription &&
    ["active", "trialing"].includes(subscription.status) &&
    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());

  return { supabase, user, profile, subscription, isActive };
}

/** For pages behind the paywall: must be logged in AND have an active subscription. */
export async function requireSubscriber() {
  const session = await getSession();
  if (!session.user) redirect("/login");
  if (!session.isActive && session.profile?.role !== "admin") redirect("/subscribe");
  return session;
}
