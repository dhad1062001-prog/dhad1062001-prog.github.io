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
    const recordAudit = async (auditAction: string, targetType = "", targetId = "", details: Record<string, unknown> = {}) => {
      const { error } = await admin.from("admin_audit_log").insert({
        actor_id: userData.user.id,
        actor_email: callerEmail,
        action: auditAction,
        target_type: targetType,
        target_id: targetId,
        details,
        result: "success",
      });
      return !error;
    };
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

    if (action === "audit_record") {
      if (!ADMIN_EMAILS.has(callerEmail)) return json({ error: "forbidden" }, 403);
      const auditAction = typeof body.audit_action === "string" ? body.audit_action.trim().slice(0, 80) : "";
      const targetType = typeof body.target_type === "string" ? body.target_type.trim().slice(0, 80) : "";
      const targetId = typeof body.target_id === "string" ? body.target_id.trim().slice(0, 200) : "";
      const details = body.details && typeof body.details === "object" && !Array.isArray(body.details) ? body.details : {};
      if (!auditAction) return json({ error: "audit_action_required" }, 400);
      const recorded = await recordAudit(auditAction, targetType, targetId, details);
      if (!recorded) return json({ error: "audit_record_failed" }, 400);
      return json({ success: true });
    }

    if (action === "audit_list") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const { data, error } = await admin.from("admin_audit_log")
        .select("id,actor_email,action,target_type,target_id,details,result,created_at")
        .order("created_at", { ascending: false }).limit(250);
      if (error) return json({ error: "audit_list_failed", detail: error.message }, 400);
      return json({ entries: data ?? [] });
    }

    if (action === "trash_list") {
      if (!ADMIN_EMAILS.has(callerEmail)) return json({ error: "forbidden" }, 403);
      const { data, error } = await admin.from("admin_trash")
        .select("id,entity_type,entity_id,title,storage_path,deleted_by_email,deleted_at,expires_at")
        .is("restored_at", null).order("deleted_at", { ascending: false }).limit(250);
      if (error) return json({ error: "trash_list_failed", detail: error.message }, 400);
      return json({ entries: data ?? [] });
    }

    if (action === "trash_material") {
      if (!ADMIN_EMAILS.has(callerEmail)) return json({ error: "forbidden" }, 403);
      const id = String(body.id ?? "");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return json({ error: "invalid_material_id" }, 400);
      }
      const { data: material, error: materialError } = await admin.from("materials")
        .select("*").eq("id", id).maybeSingle();
      if (materialError || !material) return json({ error: "material_not_found", detail: materialError?.message }, 404);
      const { data: existing, error: existingError } = await admin.from("admin_trash")
        .select("id").eq("entity_type", "material").eq("entity_id", id).is("restored_at", null).maybeSingle();
      if (existingError) return json({ error: "trash_lookup_failed", detail: existingError.message }, 400);
      if (existing) return json({ error: "material_already_in_trash" }, 409);
      const { data: trashEntry, error: trashError } = await admin.from("admin_trash").insert({
        entity_type: "material",
        entity_id: id,
        title: material.title || material.file_name || "ملف تعليمي",
        payload: material,
        storage_path: material.file_path || "",
        deleted_by: userData.user.id,
        deleted_by_email: callerEmail,
      }).select("id").single();
      if (trashError) return json({ error: "trash_save_failed", detail: trashError.message }, 400);
      const { error: hideError } = await admin.from("materials")
        .update({ is_public: false, updated_at: new Date().toISOString() }).eq("id", id);
      if (hideError) {
        await admin.from("admin_trash").delete().eq("id", trashEntry.id);
        return json({ error: "material_archive_failed", detail: hideError.message }, 400);
      }
      await recordAudit("material_moved_to_trash", "material", id, { title: material.title || material.file_name });
      return json({ success: true, trash_id: trashEntry.id, message: "تم نقل الملف إلى سلة المحذوفات وإخفاؤه عن الزوار دون حذف ملف التخزين." });
    }

    if (action === "trash_restore") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const trashId = String(body.id ?? "");
      const { data: entry, error: entryError } = await admin.from("admin_trash")
        .select("*").eq("id", trashId).is("restored_at", null).maybeSingle();
      if (entryError || !entry) return json({ error: "trash_entry_not_found", detail: entryError?.message }, 404);
      if (entry.entity_type !== "material") return json({ error: "unsupported_trash_type" }, 400);
      const payload = entry.payload as Record<string, unknown>;
      const materialId = String(payload.id ?? entry.entity_id);
      const { data: current, error: currentError } = await admin.from("materials")
        .select("id").eq("id", materialId).maybeSingle();
      if (currentError) return json({ error: "material_lookup_failed", detail: currentError.message }, 400);
      const restored = current
        ? await admin.from("materials").update({
            is_public: payload.is_public === true,
            updated_at: new Date().toISOString(),
          }).eq("id", materialId)
        : await admin.from("materials").insert({ ...payload, is_public: payload.is_public === true });
      if (restored.error) return json({ error: "material_restore_failed", detail: restored.error.message }, 400);
      const { error: markError } = await admin.from("admin_trash")
        .update({ restored_at: new Date().toISOString() }).eq("id", trashId);
      if (markError) return json({ error: "trash_restore_mark_failed", detail: markError.message }, 400);
      await recordAudit("material_restored_from_trash", "material", materialId, { title: entry.title });
      return json({ success: true, message: "تمت استعادة سجل الملف. بقي مسار التخزين الأصلي كما هو." });
    }

    if (action === "trash_purge") {
      if (callerEmail !== OWNER_EMAIL) return json({ error: "owner_only" }, 403);
      const trashId = String(body.id ?? "");
      const { data: entry, error: entryError } = await admin.from("admin_trash")
        .select("*").eq("id", trashId).is("restored_at", null).maybeSingle();
      if (entryError || !entry) return json({ error: "trash_entry_not_found", detail: entryError?.message }, 404);
      if (entry.entity_type !== "material") return json({ error: "unsupported_trash_type" }, 400);
      const materialId = String(entry.entity_id);
      if (String(entry.storage_path || "").startsWith("drive:")) {
        return json({ error: "external_storage_delete_not_connected", detail: "هذا الملف مرتبط بمساحة Google Drive غير المتصلة حاليًا. بقي الملف في السلة ولم يُحذف أي سجل أو ملف خارجي." }, 409);
      }
      const { error: linksError } = await admin.from("home_section_materials").delete().eq("material_id", materialId);
      if (linksError) return json({ error: "material_links_delete_failed", detail: linksError.message }, 400);
      const { error: materialDeleteError } = await admin.from("materials").delete().eq("id", materialId);
      if (materialDeleteError) return json({ error: "material_delete_failed", detail: materialDeleteError.message }, 400);
      if (entry.storage_path) {
        const { error: storageError } = await admin.storage.from("materials").remove([entry.storage_path]);
        if (storageError) return json({ error: "storage_delete_failed", detail: storageError.message, record_deleted: true }, 400);
      }
      const { error: trashDeleteError } = await admin.from("admin_trash").delete().eq("id", trashId);
      if (trashDeleteError) return json({ error: "trash_entry_delete_failed", detail: trashDeleteError.message }, 400);
      await recordAudit("material_permanently_deleted", "material", materialId, { title: entry.title });
      return json({ success: true, message: "تم حذف سجل الملف وروابطه وملف التخزين نهائيًا." });
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
      await recordAudit("storage_account_registered", "storage_account", data.id, { label, account_email: accountEmail });
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
      await recordAudit("storage_account_updated", "storage_account", id, { label, account_email: accountEmail });
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
      await recordAudit("storage_account_disconnected", "storage_account", id, { label: data.label });
      return json({ success: true, account: data });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (_error) {
    return json({ error: "request_failed" }, 400);
  }
});