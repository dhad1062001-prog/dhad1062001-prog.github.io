-- Dynamic, hierarchical content sections for DHAD admin center.
-- Additive only: preserves existing home_sections, materials, and links.

alter table public.home_sections
  add column if not exists parent_id bigint null
    references public.home_sections(id) on delete restrict,
  add column if not exists section_description text not null default '',
  add column if not exists icon text not null default 'folder',
  add column if not exists cover_image_path text,
  add column if not exists cover_image_alt text not null default '',
  add column if not exists show_on_home boolean not null default true,
  add column if not exists slug text;

create unique index if not exists home_sections_slug_unique
  on public.home_sections (slug)
  where slug is not null and length(btrim(slug)) > 0;

create index if not exists home_sections_parent_sort_idx
  on public.home_sections (parent_id, sort_order, id);

alter table public.home_sections
  add constraint home_sections_not_own_parent
  check (parent_id is null or parent_id <> id);

alter table public.home_section_materials
  add column if not exists is_primary boolean not null default false;

create index if not exists home_section_materials_material_idx
  on public.home_section_materials (material_id);

create unique index if not exists home_section_materials_one_primary_idx
  on public.home_section_materials (material_id)
  where is_primary = true;

create or replace function public.prevent_home_section_cycle()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  creates_cycle boolean := false;
begin
  if new.parent_id is null then
    return new;
  end if;

  if new.id is not null and new.parent_id = new.id then
    raise exception 'A section cannot be its own parent.';
  end if;

  with recursive ancestors(id, parent_id) as (
    select hs.id, hs.parent_id
    from public.home_sections hs
    where hs.id = new.parent_id
    union all
    select parent.id, parent.parent_id
    from public.home_sections parent
    join ancestors child on parent.id = child.parent_id
  )
  select exists (
    select 1 from ancestors
    where new.id is not null and id = new.id
  ) into creates_cycle;

  if creates_cycle then
    raise exception 'This parent selection would create a section cycle.';
  end if;

  return new;
end;
$$;

drop trigger if exists home_sections_prevent_cycle on public.home_sections;
create trigger home_sections_prevent_cycle
before insert or update of parent_id on public.home_sections
for each row execute function public.prevent_home_section_cycle();


-- Replace the owner-only insert policy with the existing helper that includes
-- the owner and authorized file managers. This avoids overlapping INSERT policies.
drop policy if exists "Owner can insert section material links"
  on public.home_section_materials;

create policy "File managers can insert section material links"
  on public.home_section_materials
  for insert
  to authenticated
  with check ((select public.dhad_is_file_manager()));

-- Section structure CRUD remains owner-only under the existing home_sections policies.

comment on column public.home_sections.parent_id is
  'Optional parent section. NULL means top-level section.';
comment on column public.home_sections.show_on_home is
  'Controls whether this section is placed directly on the public home page.';
comment on column public.home_sections.icon is
  'Icon identifier or emoji selected by an authorized administrator.';
comment on column public.home_section_materials.is_primary is
  'Marks the primary section association for a material; false means an additional placement.';
