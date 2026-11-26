import { createClient } from "jsr:@supabase/supabase-js@2";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function orgByCode(code: unknown): Promise<string | null> {
  if (typeof code !== "string" || !/^[0-9A-Fa-f]{14}$/.test(code.trim())) return null;
  const { data } = await admin.from("org_pair_codes").select("org_id").eq("code", code.trim().toUpperCase()).maybeSingle();
  return data ? data.org_id : null;
}
async function requireLeader(req: Request, org: unknown): Promise<string | null> {
  if (typeof org !== "string" || !UUID.test(org)) return null;
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data: u } = await admin.auth.getUser(token);
  if (!u || !u.user) return null;
  const { data: m } = await admin.from("members").select("role").eq("org_id", org).eq("user_id", u.user.id).maybeSingle();
  return m && m.role === "leder" ? org : null;
}
async function staffList(org: string) {
  const { data: pins } = await admin.from("staff_pins").select("user_id").eq("org_id", org);
  const ids = (pins || []).map((p: { user_id: string }) => p.user_id);
  if (!ids.length) return [];
  const { data: mem } = await admin.from("members").select("user_id, display_name").eq("org_id", org).in("user_id", ids);
  return (mem || []).map((m: { user_id: string; display_name: string }) => ({ id: m.user_id, name: m.display_name || "Uten navn" }))
    .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "nb"));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  try {
    switch (b.action) {
      case "roster": {
        const org = await orgByCode(b.code);
        if (!org) return json({ error: "bad_code" }, 404);
        const { data: o } = await admin.from("organizations").select("name").eq("id", org).single();
        return json({ org_name: o ? o.name : "", names: await staffList(org) });
      }
      case "login": {
        const org = await orgByCode(b.code);
        if (!org || typeof b.user_id !== "string" || !UUID.test(b.user_id) || typeof b.pin !== "string" || !/^[0-9]{4}$/.test(b.pin)) return json({ error: "wrong" }, 401);
        const { data: res, error } = await admin.rpc("staff_check_pin", { p_org: org, p_user: b.user_id, p_pin: b.pin });
        if (error) return json({ error: "server" }, 500);
        if (res === "locked") return json({ error: "locked" }, 429);
        if (res !== "ok") return json({ error: "wrong" }, 401);
        const { data: u } = await admin.auth.admin.getUserById(b.user_id);
        if (!u || !u.user || !u.user.email) return json({ error: "wrong" }, 401);
        const { data: l, error: le } = await admin.auth.admin.generateLink({ type: "magiclink", email: u.user.email });
        if (le || !l || !l.properties) return json({ error: "server" }, 500);
        return json({ token_hash: l.properties.hashed_token });
      }
      case "code": {
        const org = await requireLeader(req, b.org_id);
        if (!org) return json({ error: "forbidden" }, 403);
        const { data } = await admin.from("org_pair_codes").select("code").eq("org_id", org).maybeSingle();
        if (data && !b.renew) return json({ code: data.code });
        const { data: c, error } = await admin.rpc("org_pair_code_new", { p_org: org });
        if (error) return json({ error: "server" }, 500);
        return json({ code: c });
      }
      case "staff_list": {
        const org = await requireLeader(req, b.org_id);
        if (!org) return json({ error: "forbidden" }, 403);
        return json({ staff: await staffList(org) });
      }
      case "create_staff": {
        const org = await requireLeader(req, b.org_id);
        if (!org) return json({ error: "forbidden" }, 403);
        const name = typeof b.name === "string" ? b.name.trim() : "";
        if (!name || name.length > 120) return json({ error: "bad_name" }, 400);
        if (typeof b.pin !== "string" || !/^[0-9]{4}$/.test(b.pin)) return json({ error: "bad_pin" }, 400);
        const existing = await staffList(org);
        if (existing.length >= 200) return json({ error: "too_many" }, 400);
        if (existing.some((s: { name: string }) => s.name.toLowerCase() === name.toLowerCase())) return json({ error: "duplicate" }, 409);
        const email = `staff-${crypto.randomUUID()}@pin.spisbart.no`;
        const pw = crypto.randomUUID() + crypto.randomUUID();
        const { data: cu, error: ce } = await admin.auth.admin.createUser({ email, password: pw, email_confirm: true, user_metadata: { staff: true } });
        if (ce || !cu || !cu.user) return json({ error: "server" }, 500);
        const uid = cu.user.id;
        const { error: me } = await admin.from("members").insert({ org_id: org, user_id: uid, role: "ansatt", display_name: name });
        if (me) { await admin.auth.admin.deleteUser(uid); return json({ error: "server" }, 500); }
        const { error: pe } = await admin.rpc("staff_set_pin", { p_org: org, p_user: uid, p_pin: b.pin });
        if (pe) { await admin.auth.admin.deleteUser(uid); return json({ error: "server" }, 500); }
        return json({ id: uid, name });
      }
      case "set_pin": {
        const org = await requireLeader(req, b.org_id);
        if (!org) return json({ error: "forbidden" }, 403);
        if (typeof b.user_id !== "string" || !UUID.test(b.user_id)) return json({ error: "bad_request" }, 400);
        if (typeof b.pin !== "string" || !/^[0-9]{4}$/.test(b.pin)) return json({ error: "bad_pin" }, 400);
        const { data: has } = await admin.from("staff_pins").select("user_id").eq("org_id", org).eq("user_id", b.user_id).maybeSingle();
        if (!has) return json({ error: "not_found" }, 404);
        const { error } = await admin.rpc("staff_set_pin", { p_org: org, p_user: b.user_id, p_pin: b.pin });
        if (error) return json({ error: "server" }, 500);
        return json({ ok: true });
      }
      case "remove_staff": {
        const org = await requireLeader(req, b.org_id);
        if (!org) return json({ error: "forbidden" }, 403);
        if (typeof b.user_id !== "string" || !UUID.test(b.user_id)) return json({ error: "bad_request" }, 400);
        const { data: has } = await admin.from("staff_pins").select("user_id").eq("org_id", org).eq("user_id", b.user_id).maybeSingle();
        if (!has) return json({ error: "not_found" }, 404);
        await admin.from("members").delete().eq("org_id", org).eq("user_id", b.user_id);
        await admin.from("staff_pins").delete().eq("org_id", org).eq("user_id", b.user_id);
        await admin.auth.admin.signOut(b.user_id).catch(() => {});
        return json({ ok: true });
      }
      default:
        return json({ error: "unknown_action" }, 400);
    }
  } catch (_e) {
    return json({ error: "server" }, 500);
  }
});
