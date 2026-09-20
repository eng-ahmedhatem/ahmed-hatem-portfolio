-- Atomic, shared limits across Vercel instances. No raw IP addresses are stored.
create table if not exists public.request_limits (
  key_hash text primary key,
  hits integer not null check (hits > 0),
  expires_at timestamptz not null
);
create index if not exists request_limits_expiry_idx on public.request_limits(expires_at);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from public, anon, authenticated;
grant all on public.request_limits to service_role;

create or replace function public.portfolio_consume_limit(p_key text, p_limit integer, p_window_seconds integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_hits integer; v_expires timestamptz; v_now timestamptz := clock_timestamp();
begin
  if length(p_key) <> 64 or p_limit < 1 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit parameters';
  end if;
  -- Bounded retention even without a scheduled cleanup job.
  delete from public.request_limits where key_hash in (
    select key_hash from public.request_limits where expires_at < v_now - interval '1 day' limit 100
  );
  insert into public.request_limits as limits(key_hash, hits, expires_at)
  values (p_key, 1, v_now + make_interval(secs => p_window_seconds))
  on conflict (key_hash) do update set
    hits = case when limits.expires_at <= v_now then 1 else least(limits.hits + 1, p_limit + 1) end,
    expires_at = case when limits.expires_at <= v_now then v_now + make_interval(secs => p_window_seconds) else limits.expires_at end
  returning hits, expires_at into v_hits, v_expires;
  return jsonb_build_object('allowed', v_hits <= p_limit, 'retryAfter', greatest(1, ceil(extract(epoch from v_expires - v_now))));
end;
$$;
revoke all on function public.portfolio_consume_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.portfolio_consume_limit(text, integer, integer) to service_role;

-- Durable email state: storage succeeds even if an email provider is unavailable.
alter table public.contact_submissions add column if not exists notification_status text not null default 'pending'
  check (notification_status in ('pending', 'sent', 'failed', 'disabled'));
alter table public.contact_submissions add column if not exists notification_sent_at timestamptz;
alter table public.contact_submissions add column if not exists notification_error text;
