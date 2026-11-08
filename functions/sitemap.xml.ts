import { bootstrap } from "./_lib/bootstrap";
import { listPublished } from "./_lib/db";
import { renderSitemap } from "./_lib/render";
import type { Env } from "./_lib/types";

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    await bootstrap(context.env);
    const published = await listPublished(context.env);
    const paths = ["/", "/articles/", ...published.map((article) => `/articles/${article.slug}`)];
    return new Response(renderSitemap(paths), {
      headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
    });
  } catch (error) {
    console.error(error);
    return context.env.ASSETS.fetch(context.request);
  }
};
