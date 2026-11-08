import { newId, verifyPassword } from "../../_lib/auth";
import { bootstrap } from "../../_lib/bootstrap";
import {
  getArticle,
  getArticleBySlug,
  homepageArticles,
  insertArticle,
  listArticles,
  listMedia,
  listPublished,
  listRevisions,
  mediaInUse,
  restoreRevision,
  setStatus,
  updateArticle,
} from "../../_lib/db";
import { articleInput } from "../../_lib/input";
import { clearSessionCookie, csrfOk, json, readCookie, requireUser, sessionCookie } from "../../_lib/http";
import { IMAGE_LIMIT, VIDEO_LIMIT, readHead, sniff } from "../../_lib/media";
import { renderArticlePage } from "../../_lib/render";
import type { Env } from "../../_lib/types";
import { containsCurrency, validateArticle } from "../../_lib/validate";

type Context = { request: Request; env: Env };

declare const FixedLengthStream: {
  new (expectedLength: number): {
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
  };
};

async function founders(env: Env) {
  const rows = await env.DB.prepare("SELECT id, email, name FROM users ORDER BY id ASC").all<{
    id: string;
    email: string;
    name: string;
  }>();
  return rows.results ?? [];
}

async function knownAuthors(env: Env, ids: string[]) {
  const people = await founders(env);
  const allowed = new Set(people.map((person) => person.id));
  return ids.filter((id) => allowed.has(id));
}

async function login(request: Request, env: Env) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = (body?.email ?? "").trim().toLowerCase();
  const password = body?.password ?? "";
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const bucket = `${email}|${ip}`;
  const since = Date.now() - 15 * 60 * 1000;
  await env.DB.prepare("DELETE FROM login_attempts WHERE attempted_at < ?").bind(since).run();
  const attempts = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM login_attempts WHERE bucket = ? AND attempted_at >= ?",
  )
    .bind(bucket, since)
    .first<{ count: number }>();
  if ((attempts?.count ?? 0) >= 8) {
    return json({ error: "Too many sign-in attempts. Wait a few minutes and try again." }, 429);
  }
  const user = await env.DB.prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string; email: string; name: string; password_hash: string }>();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    await env.DB.prepare("INSERT INTO login_attempts (bucket, attempted_at) VALUES (?, ?)").bind(bucket, Date.now()).run();
    return json({ error: "Those sign-in details do not match." }, 401);
  }
  const id = newId();
  const csrf = newId();
  const now = new Date().toISOString();
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, csrf, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(id, user.id, csrf, Date.now() + 7 * 24 * 60 * 60 * 1000, now)
    .run();
  return json(
    { user: { id: user.id, email: user.email, name: user.name }, csrf, founders: await founders(env) },
    200,
    { "set-cookie": sessionCookie(id, request) },
  );
}

async function guard(request: Request, env: Env) {
  const user = await requireUser(request, env);
  if (!user) return { user: null, response: json({ error: "Sign in again." }, 401) };
  if (request.method !== "GET" && request.method !== "HEAD" && !csrfOk(request, user)) {
    return { user: null, response: json({ error: "The page expired. Reload it and try again." }, 403) };
  }
  return { user, response: null };
}

async function uploadImage(request: Request, env: Env, userId: string) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "Choose an image." }, 400);
  if (file.size > IMAGE_LIMIT) return json({ error: "Images need to be 15 MB or smaller." }, 413);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniff(bytes);
  if (!sniffed || sniffed.kind !== "image") return json({ error: "Use a JPEG, PNG, WebP, or GIF." }, 415);
  const id = newId();
  await env.MEDIA.put(`media/${id}/display`, bytes, { httpMetadata: { contentType: sniffed.mime } });
  const thumb = form.get("thumb");
  if (thumb instanceof File && thumb.size <= IMAGE_LIMIT) {
    const thumbBytes = new Uint8Array(await thumb.arrayBuffer());
    const thumbKind = sniff(thumbBytes);
    if (thumbKind?.kind === "image") {
      await env.MEDIA.put(`media/${id}/thumb`, thumbBytes, { httpMetadata: { contentType: thumbKind.mime } });
    }
  }
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  const alt = String(form.get("alt") ?? "");
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO media (id, kind, mime, bytes, width, height, alt, original_name, created_by, created_at)
     VALUES (?, 'image', ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      sniffed.mime,
      file.size,
      Number.isFinite(width) ? width : null,
      Number.isFinite(height) ? height : null,
      alt,
      file.name.slice(0, 180),
      userId,
      now,
    )
    .run();
  return json({
    media: {
      id,
      kind: "image",
      mime: sniffed.mime,
      bytes: file.size,
      width: Number.isFinite(width) ? width : null,
      height: Number.isFinite(height) ? height : null,
      alt,
      originalName: file.name,
      createdAt: now,
    },
  });
}

async function uploadVideo(request: Request, env: Env, userId: string) {
  const length = Number(request.headers.get("content-length") || 0);
  if (!request.body || !length) return json({ error: "The video upload was empty." }, 400);
  if (length > VIDEO_LIMIT) return json({ error: "Videos need to be 200 MB or smaller." }, 413);
  const { head, rest } = await readHead(request.body, 16);
  const sniffed = sniff(head);
  if (!sniffed || sniffed.kind !== "video") return json({ error: "Use an MP4 video, or paste a YouTube or Vimeo link." }, 415);
  const id = newId();
  const fixed = new FixedLengthStream(length);
  const stored = env.MEDIA.put(`media/${id}/file`, fixed.readable, { httpMetadata: { contentType: "video/mp4" } });
  await rest.pipeTo(fixed.writable);
  await stored;
  const now = new Date().toISOString();
  const name = request.headers.get("x-filename") ?? "video.mp4";
  await env.DB.prepare(
    `INSERT INTO media (id, kind, mime, bytes, width, height, alt, original_name, created_by, created_at)
     VALUES (?, 'video', 'video/mp4', ?, NULL, NULL, '', ?, ?, ?)`,
  )
    .bind(id, length, name.slice(0, 180), userId, now)
    .run();
  return json({
    media: { id, kind: "video", mime: "video/mp4", bytes: length, width: null, height: null, alt: "", originalName: name, createdAt: now },
  });
}

async function route(request: Request, env: Env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method;

  if (path === "/api/admin/login" && method === "POST") return login(request, env);
  if (path === "/api/admin/logout" && method === "POST") {
    const id = readCookie(request, "axon_session");
    if (id) await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
    return json({ ok: true }, 200, { "set-cookie": clearSessionCookie(request) });
  }

  const { user, response } = await guard(request, env);
  if (!user) return response;

  if (path === "/api/admin/me" && method === "GET") {
    return json({ user: { id: user.id, email: user.email, name: user.name }, csrf: user.csrf, founders: await founders(env) });
  }

  if (path === "/api/admin/articles" && method === "GET") {
    const articles = await listArticles(env, {
      status: url.searchParams.get("status") ?? "",
      type: url.searchParams.get("type") ?? "",
      q: url.searchParams.get("q") ?? "",
    });
    return json({ articles });
  }

  if (path === "/api/admin/articles" && method === "POST") {
    const input = articleInput(await request.json().catch(() => null));
    input.authorIds = await knownAuthors(env, input.authorIds);
    const errors = validateArticle(input, "save");
    if (errors.length) return json({ error: errors[0], errors }, 422);
    if (await getArticleBySlug(env, input.slug)) return json({ error: "That URL is already used." }, 409);
    const article = await insertArticle(env, input, user.id);
    return json({ article }, 201);
  }

  const articleMatch = path.match(/^\/api\/admin\/articles\/([^/]+)$/);
  if (articleMatch && method === "GET") {
    const article = await getArticle(env, decodeURIComponent(articleMatch[1]));
    return article ? json({ article }) : json({ error: "Article not found." }, 404);
  }
  if (articleMatch && method === "PUT") {
    const current = await getArticle(env, decodeURIComponent(articleMatch[1]));
    if (!current) return json({ error: "Article not found." }, 404);
    const input = articleInput(await request.json().catch(() => null));
    input.authorIds = await knownAuthors(env, input.authorIds);
    const errors = validateArticle(input, current.status === "published" ? "publish" : "save");
    if (errors.length) return json({ error: errors[0], errors }, 422);
    const clash = await getArticleBySlug(env, input.slug);
    if (clash && clash.id !== current.id) return json({ error: "That URL is already used." }, 409);
    const article = await updateArticle(env, current, input, user.id);
    return json({ article });
  }
  if (articleMatch && method === "DELETE") {
    const current = await getArticle(env, decodeURIComponent(articleMatch[1]));
    if (!current) return json({ error: "Article not found." }, 404);
    if (current.status === "published") return json({ error: "Unpublish the article before deleting it." }, 409);
    await env.DB.prepare("DELETE FROM article_authors WHERE article_id = ?").bind(current.id).run();
    await env.DB.prepare("DELETE FROM revisions WHERE article_id = ?").bind(current.id).run();
    await env.DB.prepare("DELETE FROM homepage_picks WHERE article_id = ?").bind(current.id).run();
    await env.DB.prepare("DELETE FROM articles WHERE id = ?").bind(current.id).run();
    return json({ ok: true });
  }

  const actionMatch = path.match(/^\/api\/admin\/articles\/([^/]+)\/(publish|unpublish|archive|revisions|restore|preview)$/);
  if (actionMatch) {
    const id = decodeURIComponent(actionMatch[1]);
    const action = actionMatch[2];
    const current = await getArticle(env, id);
    if (!current) return json({ error: "Article not found." }, 404);
    if (action === "preview" && method === "GET") {
      const page = htmlNoStore(renderArticlePage(current, url.origin, true));
      return page;
    }
    if (action === "revisions" && method === "GET") return json({ revisions: await listRevisions(env, id) });
    if (action === "restore" && method === "POST") {
      const body = (await request.json().catch(() => null)) as { revisionId?: string } | null;
      const article = await restoreRevision(env, id, body?.revisionId ?? "", user.id);
      return article ? json({ article }) : json({ error: "Revision not found." }, 404);
    }
    if (action === "publish" && method === "POST") {
      const errors = validateArticle(current, "publish");
      if (errors.length) return json({ error: errors[0], errors }, 422);
      return json({ article: await setStatus(env, current, "published", user.id) });
    }
    if (action === "unpublish" && method === "POST") return json({ article: await setStatus(env, current, "draft", user.id) });
    if (action === "archive" && method === "POST") return json({ article: await setStatus(env, current, "archived", user.id) });
  }

  if (path === "/api/admin/media" && method === "GET") return json({ media: await listMedia(env) });
  if (path === "/api/admin/media" && method === "POST") return uploadImage(request, env, user.id);
  if (path === "/api/admin/media/video" && method === "POST") return uploadVideo(request, env, user.id);

  const mediaMatch = path.match(/^\/api\/admin\/media\/([^/]+)$/);
  if (mediaMatch && method === "PATCH") {
    const id = decodeURIComponent(mediaMatch[1]);
    const body = (await request.json().catch(() => null)) as { alt?: string } | null;
    const alt = body?.alt ?? "";
    if (containsCurrency(alt)) return json({ error: "Remove currency amounts from the alt text." }, 422);
    await env.DB.prepare("UPDATE media SET alt = ? WHERE id = ?").bind(alt, id).run();
    return json({ ok: true });
  }
  if (mediaMatch && method === "DELETE") {
    const id = decodeURIComponent(mediaMatch[1]);
    if (await mediaInUse(env, id)) return json({ error: "That file is still used by an article." }, 409);
    await env.MEDIA.delete(`media/${id}/display`);
    await env.MEDIA.delete(`media/${id}/thumb`);
    await env.MEDIA.delete(`media/${id}/file`);
    await env.DB.prepare("DELETE FROM media WHERE id = ?").bind(id).run();
    return json({ ok: true });
  }

  if (path === "/api/admin/homepage" && method === "GET") {
    const [selected, published] = await Promise.all([homepageArticles(env), listPublished(env)]);
    return json({
      selected: selected.map((article) => article.id),
      published: published.map((article) => ({
        id: article.id,
        title: article.listTitle || article.title,
        slug: article.slug,
      })),
    });
  }
  if (path === "/api/admin/homepage" && method === "PUT") {
    const body = (await request.json().catch(() => null)) as { articleIds?: string[] } | null;
    const ids = (body?.articleIds ?? []).filter(Boolean).slice(0, 3);
    for (const id of ids) {
      const article = await getArticle(env, id);
      if (!article || article.status !== "published") return json({ error: "Homepage picks must be published articles." }, 422);
    }
    await env.DB.prepare("DELETE FROM homepage_picks").run();
    let position = 0;
    for (const id of ids) {
      await env.DB.prepare("INSERT INTO homepage_picks (position, article_id) VALUES (?, ?)").bind(position, id).run();
      position += 1;
    }
    return json({ selected: ids });
  }

  return json({ error: "Not found." }, 404);
}

function htmlNoStore(body: string) {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export const onRequest = async (context: Context) => {
  try {
    await bootstrap(context.env);
    if (!context.env.FOUNDER_PASSWORD) {
      const path = new URL(context.request.url).pathname;
      if (path.endsWith("/login")) return json({ error: "Set FOUNDER_PASSWORD before signing in." }, 503);
    }
    return await route(context.request, context.env);
  } catch (error) {
    console.error(error);
    return json({ error: "Something went wrong." }, 500);
  }
};
