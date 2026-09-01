create extension if not exists pgcrypto;

create table if not exists public.content_records (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('site-settings', 'homepage', 'static-page', 'project', 'post', 'category')),
  entity_id text not null check (entity_id ~ '^[a-zA-Z0-9_-]+$'),
  payload jsonb not null,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, entity_id)
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  email text not null check (char_length(email) between 3 and 320),
  phone text check (char_length(phone) <= 40),
  service text not null check (char_length(service) between 1 and 120),
  budget text check (char_length(budget) <= 120),
  details text not null check (char_length(details) between 1 and 5000),
  preferred_contact text check (char_length(preferred_contact) <= 120),
  locale text not null check (locale in ('ar', 'en')),
  page_path text not null check (char_length(page_path) <= 500 and page_path like '/%'),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  path text not null check (char_length(path) <= 500 and path like '/%'),
  locale text not null check (locale in ('ar', 'en')),
  device text not null check (device in ('mobile', 'tablet', 'desktop')),
  referrer text check (char_length(referrer) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists content_records_kind_idx on public.content_records (kind);
create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx on public.contact_submissions (status);
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_visitor_hash_idx on public.page_views (visitor_hash);
create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists page_views_device_idx on public.page_views (device);

create or replace function public.set_portfolio_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_records_set_updated_at on public.content_records;
create trigger content_records_set_updated_at
before update on public.content_records
for each row execute function public.set_portfolio_updated_at();

drop trigger if exists contact_submissions_set_updated_at on public.contact_submissions;
create trigger contact_submissions_set_updated_at
before update on public.contact_submissions
for each row execute function public.set_portfolio_updated_at();

alter table public.content_records enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.page_views enable row level security;

revoke all on table public.content_records from anon, authenticated;
revoke all on table public.contact_submissions from anon, authenticated;
revoke all on table public.page_views from anon, authenticated;
grant select, insert, update, delete on table public.content_records to service_role;
grant select, insert, update, delete on table public.contact_submissions to service_role;
grant select, insert, update, delete on table public.page_views to service_role;

create or replace function public.portfolio_analytics_summary(p_from timestamptz)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'views', (
      select count(*)::integer
      from public.page_views
      where created_at >= p_from
    ),
    'uniqueVisitors', (
      select count(distinct visitor_hash)::integer
      from public.page_views
      where created_at >= p_from
    ),
    'byDevice', (
      select coalesce(
        jsonb_agg(jsonb_build_object('_id', stats.device, 'value', stats.value) order by stats.value desc),
        '[]'::jsonb
      )
      from (
        select device, count(*)::integer as value
        from public.page_views
        where created_at >= p_from
        group by device
      ) as stats
    ),
    'byDay', (
      select coalesce(
        jsonb_agg(jsonb_build_object('_id', stats.day, 'value', stats.value) order by stats.day),
        '[]'::jsonb
      )
      from (
        select to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') as day, count(*)::integer as value
        from public.page_views
        where created_at >= p_from
        group by day
      ) as stats
    ),
    'topPages', (
      select coalesce(
        jsonb_agg(jsonb_build_object('_id', stats.path, 'value', stats.value) order by stats.value desc),
        '[]'::jsonb
      )
      from (
        select path, count(*)::integer as value
        from public.page_views
        where created_at >= p_from
        group by path
        order by value desc
        limit 10
      ) as stats
    )
  );
$$;

revoke all on function public.set_portfolio_updated_at() from public, anon, authenticated;
revoke all on function public.portfolio_analytics_summary(timestamptz) from public, anon, authenticated;
grant execute on function public.portfolio_analytics_summary(timestamptz) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
