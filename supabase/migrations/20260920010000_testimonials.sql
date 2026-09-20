-- Extend CMS record types without changing existing records or RLS policies.
begin;
alter table public.content_records drop constraint if exists content_records_kind_check;
alter table public.content_records add constraint content_records_kind_check
  check (kind in ('site-settings', 'homepage', 'static-page', 'project', 'post', 'category', 'testimonial'));
commit;
