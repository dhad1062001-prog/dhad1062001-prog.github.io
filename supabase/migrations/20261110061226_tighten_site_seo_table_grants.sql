revoke all on table public.site_seo from anon, authenticated, public;
grant select on table public.site_seo to anon, authenticated;
grant insert, update, delete on table public.site_seo to authenticated;
