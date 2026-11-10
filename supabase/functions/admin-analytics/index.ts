import { createClient } from "npm:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://dhad1062001-prog.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!["GET", "POST"].includes(req.method)) return json({ error: "method_not_allowed" }, 405);
  const origin = req.headers.get("origin");
  if (origin && origin !== "https://dhad1062001-prog.github.io") return json({ error: "origin_not_allowed" }, 403);
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token || token === auth) return json({ error: "unauthorized" }, 401);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "unauthorized" }, 401);
    const email = (userData.user.email ?? "").trim().toLowerCase();
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const ownerEmail = "dhad1062001@gmail.com";
    const builtInAdmins = new Set([ownerEmail, "abeer112026@gmail.com"]);
    let staffAccess: { role?: string; permissions?: Record<string, unknown>; status?: string } | null = null;
    if (!builtInAdmins.has(email)) {
      const { data: staff, error: staffError } = await admin.from("admin_staff")
        .select("role,permissions,status")
        .ilike("email", email).maybeSingle();
      if (staffError) return json({ error: "authorization_lookup_failed" }, 503);
      staffAccess = staff;
    }
    const staffIsActive = !!staffAccess && ["invited", "active"].includes(staffAccess.status ?? "");
    const allowed = builtInAdmins.has(email) ||
      (staffIsActive && (staffAccess?.role === "admin" || staffAccess?.permissions?.analytics === true));
    if (!allowed) return json({ error: "forbidden" }, 403);
    let from = new Date(Date.now() - 30 * 86400000).toISOString();
    let to = new Date().toISOString();
    if (req.method === "POST") {
      const body = await req.json();
      if (typeof body.from === "string") from = body.from;
      if (typeof body.to === "string") to = body.to;
    }
    const { data, error } = await admin.rpc("get_admin_analytics", { p_from: from, p_to: to });
    if (error) return json({ error: "analytics_query_failed" }, 400);
    return json(data);
  } catch (_error) {
    return json({ error: "request_failed" }, 400);
  }
});