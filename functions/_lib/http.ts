import type { Env } from "./types";

export type SessionUser = { id: string; email: string; name: string; csrf: string };

export function json(data: unknown, status = 200, extra: HeadersInit = {}) {
  const headers = new Headers(extra);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { status, headers });
}

export function html(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60",
      "x-content-type-options": "nosniff",
    },
  });
}

export function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

export function sessionCookie(id: string, request: Request, maxAge = 60 * 60 * 24 * 7) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `axon_session=${encodeURIComponent(id)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie(request: Request) {
  return sessionCookie("", request, 0);
}

export async function requireUser(request: Request, env: Env) {
  const id = readCookie(request, "axon_session");
  if (!id) return null;
  const row = await env.DB.prepare(
    `SELECT sessions.csrf, sessions.expires_at, users.id, users.email, users.name
     FROM sessions JOIN users ON users.id = sessions.user_id
     WHERE sessions.id = ?`,
  )
    .bind(id)
    .first<{ csrf: string; expires_at: number; id: string; email: string; name: string }>();
  if (!row || row.expires_at < Date.now()) return null;
  return { id: row.id, email: row.email, name: row.name, csrf: row.csrf } satisfies SessionUser;
}

function timingSafeEqual(left: string, right: string) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let mismatch = a.length === b.length ? 0 : 1;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) mismatch |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return mismatch === 0;
}

export function csrfOk(request: Request, user: SessionUser) {
  const header = request.headers.get("x-csrf") ?? "";
  return Boolean(header) && timingSafeEqual(header, user.csrf);
}
