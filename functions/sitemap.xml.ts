import { bootstrap } from "./_lib/bootstrap";
import { listPublished } from "./_lib/db";
import { renderSitemap } from "./_lib/render";
import type { BoundEnv, Env } from "./_lib/types";

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    if (!context.env.DB) return context.env.ASSETS.fetch(context.request);
    const env = context.env as BoundEnv;
    await bootstrap(env);
    const published = await listPublished(env);
    const paths = ["/", "/articles/", ...published.map((article) => `/articles/${article.slug}`)];
    return new Response(renderSitemap(paths), {
      headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
    });
  } catch (error) {
    console.error(error);
    return context.env.ASSETS.fetch(context.request);
  }
};
