# DHAD Admin Center — Architecture and Delivery Plan

## Agreed product direction

Build on the existing independent `admin.html` entry point and preserve the current public site and Supabase data. The admin center uses the approved dark olive, muted gold, and white identity with a fully RTL Arabic interface.

## Scope confirmed by the owner

1. Full site administration: homepage text, titles, images, buttons, links, page content, and visibility.
2. Section management: create, edit, archive/hide, reorder, choose icon/cover/description, and choose where each section appears.
3. Hierarchical sections: top-level sections and nested subsections; placement is manual. A section can be shown on the homepage or only inside its parent.
4. File upload: choose the primary section first, then an optional child section, then upload one or multiple files. Files can be attached to a section without duplicating the stored object.
5. Educational structure: grades, semesters, curricula, lessons, worksheets, and assessments.
6. Modern private analytics, reusing the existing analytics events and admin-analytics function.
7. Multiple Google Drive backup accounts, connected through a secure backend OAuth flow. No OAuth refresh token or service secret may be stored in browser code.
8. Admin accounts and role-based permissions, enforced in database policies and backend checks, not merely by hiding controls.
9. Audit history, safe deletion/archival, backup and recovery procedures.

## Current system facts verified before implementation

- The independent `admin.html` exists, but currently contains analytics and a link to legacy tools in `platform.html`.
- Existing `olive-theme.css` is already linked by the admin page. Its palette is dark olive `#20291C`, deep olive `#2D3829`, muted gold `#C3A45F`, and white.
- Existing tables include `home_sections`, `home_section_materials`, `materials`, `grades`, `semesters`, `categories`, `site_pages`, `site_contact_links`, and `profiles`.
- Existing materials and school data must remain intact. Current verified row counts included 104 materials, 13 grades, 2 semesters, and 6 categories.
- `home_sections` and `home_section_materials` currently have no rows, so the new hierarchy can be introduced additively without migrating existing section records.
- Existing `materials.primary_section` has a CHECK constraint limiting it to legacy fixed keys. New flexible section membership will therefore be represented through `home_section_materials`, not by writing arbitrary values into that legacy column.
- Existing public analytics are stored in `private.analytics_events`; `admin-analytics` is active and JWT-protected.
- Current owner/file-manager authorization helpers contain hard-coded identity logic. A later permissions phase must replace that with a deliberate role-and-permission model without accidentally broadening access.

## First schema increment

The accompanying migration extends the existing section tables rather than replacing them:

- `home_sections.parent_id`: hierarchical parent relation.
- `section_description`, `icon`, `cover_image_path`, `cover_image_alt`: presentation fields.
- `show_on_home`: manual homepage placement.
- `slug`: optional unique stable identifier.
- `home_section_materials.is_primary`: marks the selected primary section while retaining additional placements.
- Indexes support parent ordering and material lookup.
- A database trigger rejects parent cycles.

The migration intentionally does not delete or rewrite existing materials, sections, users, analytics, storage objects, or legacy section keys.

## Current implementation on `feature/admin-center-foundation`

- The independent admin page now includes an owner-only section editor for top-level and child sections, optional unique slug, description, icon, sort order, active state, and manual homepage visibility.
- The existing private analytics dashboard now includes a compact daily traffic/download trend chart.
- The admin page now includes owner controls for homepage title, subtitle, description, visibility, site branding, logo/background images, the about/privacy/contact page text, and contact links.
- It also includes owner-only creation and editing for grades, semesters, and categories; deletion is intentionally omitted so existing materials cannot be orphaned.
- The admin page now includes single/bulk upload controls: choose a top-level section, optionally choose one of its children, then select multiple files. Files are stored in the existing `materials` bucket and metadata in the existing `materials` table.
- Upload associations are written to `home_section_materials`; when a child is selected, the parent association is retained and the child association is marked primary. The legacy `materials.primary_section` field is intentionally not populated with dynamic section slugs.
- File-manager accounts can insert section-material associations through one narrowly scoped RLS policy in the migration; editing the section hierarchy remains owner-only.
- Public rendering now nests child sections inside their parent and only renders top-level sections with `show_on_home = true`. A fallback query preserves compatibility before the new columns exist.
- The admin and public inline JavaScript passed syntax compilation checks. Database integration testing is pending because the migration has not been applied.

## Rollout and safety gates

1. Review the migration and schema diff.
2. Apply the additive migration only after the owner approves the exact SQL.
3. Test section creation/editing, parent-cycle rejection, manual homepage placement, and public nested rendering in a safe environment.
4. Test one-file and multi-file uploads for owner and file-manager accounts, including the partial-failure case where metadata is saved but section linking is denied.
5. Verify old materials, existing homepage blocks, file previews/downloads, and analytics remain unchanged.
6. Build the remaining admin modules in separate tested increments.
7. Merge only after the owner reviews and approves the pull request.

## Known security findings to address in the security phase

Supabase Security Advisors currently report:
- `private.analytics_events` has RLS enabled but no policies (private schema access must be reviewed).
- Several functions have mutable search paths.
- Some SECURITY DEFINER functions are executable by public roles.
- Leaked-password protection is disabled.

These are recorded for a deliberate security review; this first section migration does not alter those existing functions or policies.
