import { createClient } from "npm:@supabase/supabase-js@2";

const SITE_ORIGIN = "https://dhad1062001-prog.github.io";
const OWNER_EMAIL = "dhad1062001@gmail.com";
const ADMIN_EMAILS = new Set([OWNER_EMAIL, "abeer112026@gmail.com"]);
const corsHeaders = {
  "Access-Control-Allow-Origin": SITE_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const cleanEmail = (value: unknown) => typeof value === "string" ? value.trim().toLowerCase() : "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const origin = req.headers.get("origin");
  if (origin && origin !== SITE_ORIGIN) return json({ error: "origin_not_allowed" }, 403);

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token || token === authHeader) return json({ error: "unauthorized" }, 401);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return json({ error: "server_not_configured" }, 500);

    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "unauthorized" }, 401);
    const callerEmail = cleanEmail(userData.user.email);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    if (!ADMIN_EMAILS.has(callerEmail) && action !== "my_access") {
      const { data: staffAccess, error: staffAccessError } = await admin.from("admin_staff")
        .select("id,email,role,permissions,status")
        .ilike("email", callerEmail).maybeSingle();
      if (staffAccessError || !staffAccess || !["invited", "active"].includes(staffAccess.status)) {
        return json({ error: "forbidden" }, 403);
      }
    }

    if (action === "my_access") {
      if (ADMIN_EMAILS.has(callerEmail)) {
        return json({ allowed: true, owner: callerEmail === OWNER_EMAIL, role: callerEmail === OWNER_EMAIL ? "owner" : "admin", permissions: { files: true, file_delete: true, content: true, analytics: true, settings: true } });
      }
      const { data: staff, error } = await admin.from("admin_staff")
        .select("id,email,display_name,role,permissions,status")
        .ilike("email", callerEmail).maybeSingle();
      if (error || !staff || !["invited","active"].includes(staff.status)) return json({ allowed: false }, 403);
      const permissions = staff.role === "admin"
        ? { files: true, file_delete: true, content: true, analytics: true, settings: true }
        : (staff.permissions ?? {});
      return json({ allowed: true, owner: false, role: staff.role, permissions, staff });
    }

    if (action === "staff_list") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const { data, error } = await admin.from("admin_staff")
        .select("id,email,display_name,role,permissions,status,auth_user_id,invited_at,created_at,updated_at")
        .order("created_at", { ascending: false });
      if (error) return json({ error: "staff_list_failed", detail: error.message }, 400);
      return json({ staff: data ?? [] });
    }

    if (action === "staff_invite") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const email = cleanEmail(body.email);
      const displayName = typeof body.display_name === "string" ? body.display_name.trim().slice(0, 120) : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !displayName) {
        return json({ error: "valid_email_and_name_required" }, 400);
      }
      if (ADMIN_EMAILS.has(email)) return json({ error: "built_in_admin_cannot_be_reassigned" }, 400);

      const { data: existingStaff, error: existingError } = await admin.from("admin_staff")
        .select("id,status").ilike("email", email).maybeSingle();
      if (existingError) return json({ error: "staff_lookup_failed", detail: existingError.message }, 400);
      if (existingStaff && existingStaff.status !== "disabled") return json({ error: "staff_already_exists" }, 409);

      let authUserId: string | null = null;
      const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (usersError) return json({ error: "auth_user_lookup_failed", detail: usersError.message }, 400);
      const existingUser = usersData.users.find((u) => cleanEmail(u.email) === email);

      if (existingUser) {
        authUserId = existingUser.id;
      } else {
        const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
          data: { full_name: displayName },
          redirectTo: `${SITE_ORIGIN}/admin/`,
        });
        if (inviteError) return json({ error: "invite_failed", detail: inviteError.message }, 400);
        authUserId = inviteData.user?.id ?? null;
      }

      const record = {
        email,
        display_name: displayName,
        role: "file_manager",
        permissions: { files: true, file_delete: false },
        status: "active",
        auth_user_id: authUserId,
        created_by: userData.user.id,
        invited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const write = existingStaff
        ? await admin.from("admin_staff").update(record).eq("id", existingStaff.id).select().single()
        : await admin.from("admin_staff").insert(record).select().single();
      if (write.error) return json({ error: "staff_save_failed", detail: write.error.message }, 400);
      return json({ success: true, staff: write.data, invitation_sent: !existingUser });
    }

    if (action === "staff_update") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const id = String(body.id ?? "");
      const displayName = typeof body.display_name === "string" ? body.display_name.trim().slice(0, 120) : "";
      const files = body.permissions?.files === true;
      const fileDelete = body.permissions?.file_delete === true;
      if (!id || !displayName) return json({ error: "staff_id_and_name_required" }, 400);
      const { data, error } = await admin.from("admin_staff")
        .update({ display_name: displayName, permissions: { files, file_delete: fileDelete }, updated_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) return json({ error: "staff_update_failed", detail: error.message }, 400);
      return json({ success: true, staff: data });
    }

    if (action === "staff_disable") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const id = String(body.id ?? "");
      if (!id) return json({ error: "staff_id_required" }, 400);
      const { data, error } = await admin.from("admin_staff")
        .update({ status: "disabled", updated_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) return json({ error: "staff_disable_failed", detail: error.message }, 400);
      return json({ success: true, staff: data });
    }

    if (action === "storage_list") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const { data, error } = await admin.from("storage_accounts")
        .select("id,provider,label,account_email,status,metadata,created_at,updated_at")
        .order("created_at", { ascending: true });
      if (error) return json({ error: "storage_list_failed", detail: error.message }, 400);
      return json({ accounts: data ?? [] });
    }

    if (action === "storage_add") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const label = typeof body.label === "string" ? body.label.trim().slice(0, 80) : "";
      const accountEmail = cleanEmail(body.account_email);
      if (!label) return json({ error: "storage_label_required" }, 400);
      const { data, error } = await admin.from("storage_accounts")
        .insert({ provider: "google_drive", label, account_email: accountEmail || null, status: "pending", created_by: userData.user.id })
        .select("id,provider,label,account_email,status,metadata,created_at,updated_at").single();
      if (error) return json({ error: "storage_add_failed", detail: error.message }, 400);
      return json({ success: true, account: data, connection_ready: false, message: "تم تسجيل مساحة التخزين. يلزم إعداد Google OAuth قبل تفعيل الاتصال الآمن." });
    }

    if (action === "storage_update") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const id = String(body.id ?? "");
      const label = typeof body.label === "string" ? body.label.trim().slice(0, 80) : "";
      const accountEmail = cleanEmail(body.account_email);
      if (!id || !label) return json({ error: "storage_id_and_label_required" }, 400);
      const { data, error } = await admin.from("storage_accounts")
        .update({ label, account_email: accountEmail || null, updated_at: new Date().toISOString() })
        .eq("id", id).select("id,provider,label,account_email,status,metadata,created_at,updated_at").single();
      if (error) return json({ error: "storage_update_failed", detail: error.message }, 400);
      return json({ success: true, account: data });
    }

    if (action === "storage_disconnect") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const id = String(body.id ?? "");
      if (!id) return json({ error: "storage_id_required" }, 400);
      const { data, error } = await admin.from("storage_accounts")
        .update({ status: "disconnected", updated_at: new Date().toISOString() })
        .eq("id", id).select("id,provider,label,account_email,status,metadata,created_at,updated_at").single();
      if (error) return json({ error: "storage_disconnect_failed", detail: error.message }, 400);
      return json({ success: true, account: data });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (_error) {
    return json({ error: "request_failed" }, 400);
  }
});