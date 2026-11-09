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

## Rollout and safety gates

1. Review the migration and schema diff.
2. Apply the additive migration only after the owner approves the exact SQL.
3. Build the section manager and dependent upload controls on this feature branch.
4. Add public rendering for root sections and nested sections, with manual homepage placement and direct links.
5. Verify one-file and multi-file uploads, file links, old materials, existing homepage blocks, and analytics.
6. Build the remaining admin modules in separate tested increments.
7. Merge only after the owner reviews and approves the pull request.

## Known security findings to address in the security phase

Supabase Security Advisors currently report:
- `private.analytics_events` has RLS enabled but no policies (private schema access must be reviewed).
- Several functions have mutable search paths.
- Some SECURITY DEFINER functions are executable by public roles.
- Leaked-password protection is disabled.

These are recorded for a deliberate security review; this first section migration does not alter those existing functions or policies.
