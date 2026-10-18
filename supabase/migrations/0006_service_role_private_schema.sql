-- The profiles trigger calls private.is_admin(); the server (service_role) must be able to resolve it,
-- otherwise every server-side profile update (e.g. saving the Stripe customer id) fails.
grant usage on schema private to service_role;
grant execute on function private.is_admin() to service_role;
grant execute on function private.has_active_subscription() to service_role;
grant execute on function private.has_premium() to service_role;
