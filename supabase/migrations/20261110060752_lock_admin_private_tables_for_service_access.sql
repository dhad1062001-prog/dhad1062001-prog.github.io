alter table private.admin_audit_log set schema public;
alter table private.admin_trash set schema public;

revoke all on table public.admin_audit_log, public.admin_trash from anon, authenticated, public;
grant all on table public.admin_audit_log, public.admin_trash to service_role;
revoke all on sequence public.admin_audit_log_id_seq from anon, authenticated, public;
grant usage, select on sequence public.admin_audit_log_id_seq to service_role;

alter table public.admin_audit_log enable row level security;
alter table public.admin_trash enable row level security;
