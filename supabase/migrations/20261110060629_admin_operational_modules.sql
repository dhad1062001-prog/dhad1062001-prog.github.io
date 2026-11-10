create table if not exists public.site_seo (
  page_path text primary key,
  page_title text not null default '',
  meta_description text not null default '',
  canonical_url text not null default '',
  robots text not null default 'index,follow',
  og_title text not null default '',
  og_description text not null default '',
  og_image_url text not null default '',
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint site_seo_page_path_check check (page_path like '/%'),
  constraint site_seo_robots_check check (robots in ('index,follow','noindex,follow','noindex,nofollow'))
);
alter table public.site_seo enable row level security;
grant select on table public.site_seo to anon, authenticated;
grant insert, update, delete on table public.site_seo to authenticated;

create policy "Public can read published SEO metadata"
on public.site_seo for select to anon, authenticated
using (is_published = true);
create policy "Owner can read all SEO metadata"
on public.site_seo for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) = 'dhad1062001@gmail.com');
create policy "Owner can insert SEO metadata"
on public.site_seo for insert to authenticated
with check (lower(coalesce(auth.jwt() ->> 'email','')) = 'dhad1062001@gmail.com');
create policy "Owner can update SEO metadata"
on public.site_seo for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) = 'dhad1062001@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email','')) = 'dhad1062001@gmail.com');
create policy "Owner can delete SEO metadata"
on public.site_seo for delete to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) = 'dhad1062001@gmail.com');

create table if not exists private.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_email text not null default '',
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  result text not null default 'success',
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_log_created_at_idx
  on private.admin_audit_log (created_at desc);
alter table private.admin_audit_log enable row level security;
grant all on table private.admin_audit_log to service_role;
grant usage, select on sequence private.admin_audit_log_id_seq to service_role;

create table if not exists private.admin_trash (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  title text not null default '',
  payload jsonb not null,
  storage_path text not null default '',
  deleted_by uuid,
  deleted_by_email text not null default '',
  deleted_at timestamptz not null default now(),
  restored_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  constraint admin_trash_entity_type_check check (entity_type in ('material'))
);
create index if not exists admin_trash_deleted_at_idx
  on private.admin_trash (deleted_at desc) where restored_at is null;
alter table private.admin_trash enable row level security;
grant all on table private.admin_trash to service_role;
