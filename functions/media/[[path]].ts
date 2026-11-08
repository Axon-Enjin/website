import { bootstrap } from "../_lib/bootstrap";
import type { Env } from "../_lib/types";

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  await bootstrap(context.env);
  const parts = new URL(context.request.url).pathname.split("/").filter(Boolean);
  const id = parts[1] ?? "";
  const thumb = parts[2] === "thumb";
  if (!id || !/^[\w-]+$/.test(id)) return new Response("Not found", { status: 404 });
  const row = await context.env.DB.prepare("SELECT kind, mime FROM media WHERE id = ?")
    .bind(id)
    .first<{ kind: "image" | "video"; mime: string }>();
  if (!row) return new Response("Not found", { status: 404 });
  const key = row.kind === "video" ? `media/${id}/file` : thumb ? `media/${id}/thumb` : `media/${id}/display`;
  const object = (await context.env.MEDIA.get(key)) ?? (thumb ? await context.env.MEDIA.get(`media/${id}/display`) : null);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  headers.set("content-type", object.httpMetadata?.contentType || row.mime);
  headers.set("cache-control", "public, max-age=3600");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
};
