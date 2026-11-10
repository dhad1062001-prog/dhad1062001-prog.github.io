-- Content records for section-level text and isolated HTML activities.
-- Public visitors can read published content; only the existing owner account can manage records.
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 240),
  description text not null default '',
  content_type text not null check (content_type in ('text', 'html')),
  body text not null default '',
  storage_path text,
  file_name text,
  mime_type text,
  file_size bigint check (file_size is null or file_size > 0),
  section_id bigint references public.home_sections(id) on delete set null,
  placement_key text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_items_placement_required check (
    section_id is not null or nullif(btrim(placement_key), '') is not null
  ),
  constraint content_items_payload_valid check (
    (content_type = 'text' and length(btrim(body)) > 0 and storage_path is null)
    or
    (content_type = 'html' and nullif(btrim(storage_path), '') is not null
      and nullif(btrim(file_name), '') is not null)
  )
);

create index if not exists content_items_section_status_order_idx
  on public.content_items (section_id, status, sort_order, created_at);
create index if not exists content_items_placement_status_order_idx
  on public.content_items (placement_key, status, sort_order, created_at);

alter table public.content_items enable row level security;

revoke all on table public.content_items from anon, authenticated;
grant select on table public.content_items to anon, authenticated;
grant insert, update, delete on table public.content_items to authenticated;

drop policy if exists content_items_public_read_published on public.content_items;
create policy content_items_public_read_published
  on public.content_items for select to anon, authenticated
  using (status = 'published');

drop policy if exists content_items_owner_read_all on public.content_items;
create policy content_items_owner_read_all
  on public.content_items for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'dhad1062001@gmail.com');

drop policy if exists content_items_owner_insert on public.content_items;
create policy content_items_owner_insert
  on public.content_items for insert to authenticated
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'dhad1062001@gmail.com');

drop policy if exists content_items_owner_update on public.content_items;
create policy content_items_owner_update
  on public.content_items for update to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'dhad1062001@gmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'dhad1062001@gmail.com');

drop policy if exists content_items_owner_delete on public.content_items;
create policy content_items_owner_delete
  on public.content_items for delete to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'dhad1062001@gmail.com');
