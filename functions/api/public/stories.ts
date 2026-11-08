import { bootstrap } from "../../_lib/bootstrap";
import { homepageArticles } from "../../_lib/db";
import { json } from "../../_lib/http";
import { toPublicStory } from "../../_lib/render";
import type { Env } from "../../_lib/types";

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    await bootstrap(context.env);
    const articles = await homepageArticles(context.env);
    return json({ stories: articles.map(toPublicStory) });
  } catch (error) {
    console.error(error);
    return json({ stories: [] });
  }
};
