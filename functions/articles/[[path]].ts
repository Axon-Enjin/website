import { bootstrap } from "../_lib/bootstrap";
import { getArticleBySlug, listPublished } from "../_lib/db";
import { html } from "../_lib/http";
import { renderArticleIndex, renderArticlePage } from "../_lib/render";
import type { Env } from "../_lib/types";

function redirect(origin: string, path: string) {
  return new Response(null, { status: 301, headers: { location: new URL(path, origin).toString() } });
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const url = new URL(context.request.url);
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    await bootstrap(context.env);
    const exact = await context.env.DB.prepare("SELECT to_path FROM redirects WHERE from_path = ?")
      .bind(url.pathname)
      .first<{ to_path: string }>();
    if (exact) return redirect(url.origin, exact.to_path);

    const path = url.pathname.replace(/\/+$/, "") || "/articles";
    if (path === "/articles") {
      const published = await listPublished(context.env);
      if (!published.length) return context.env.ASSETS.fetch(context.request);
      const response = html(renderArticleIndex(published));
      if (context.request.method === "HEAD") return new Response(null, { status: 200, headers: response.headers });
      return response;
    }

    const slug = decodeURIComponent(path.slice("/articles/".length));
    if (!slug || slug === "index.html") {
      const published = await listPublished(context.env);
      if (!published.length) return context.env.ASSETS.fetch(context.request);
      return html(renderArticleIndex(published));
    }
    const article = await getArticleBySlug(context.env, slug);
    if (article?.status === "published") return html(renderArticlePage(article, url.origin));
    if (article) return new Response("Not found", { status: 404 });
  } catch (error) {
    console.error(error);
  }
  return context.env.ASSETS.fetch(context.request);
};
