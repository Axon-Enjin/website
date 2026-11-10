import type { ArticleInput, ArticleLink, Block, Hero } from "./types";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function articleInput(data: unknown): ArticleInput {
  const source = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const hero = source.hero;
  let parsedHero: Hero | null = null;
  if (hero && typeof hero === "object") {
    const item = hero as Record<string, unknown>;
    if (item.kind === "image") {
      parsedHero = {
        kind: "image",
        mediaId: text(item.mediaId),
        alt: text(item.alt),
        caption: text(item.caption),
      };
    } else if (item.kind === "video") {
      parsedHero = {
        kind: "video",
        mediaId: text(item.mediaId),
        posterId: text(item.posterId),
        caption: text(item.caption),
      };
    }
  }
  const links: ArticleLink[] = Array.isArray(source.links)
    ? source.links.slice(0, 8).map((link) => {
        const item = link && typeof link === "object" ? (link as Record<string, unknown>) : {};
        return { href: text(item.href), label: text(item.label) };
      })
    : [];
  return {
    slug: text(source.slug).trim(),
    title: text(source.title),
    listTitle: text(source.listTitle),
    dek: text(source.dek),
    card: text(source.card),
    result: text(source.result),
    cardArt: text(source.cardArt).trim(),
    type: text(source.type),
    byline: text(source.byline),
    body: Array.isArray(source.body) ? (source.body as Block[]) : [],
    hero: parsedHero,
    links,
    seoTitle: text(source.seoTitle),
    seoDescription: text(source.seoDescription),
    authorIds: Array.isArray(source.authorIds) ? source.authorIds.map((id) => text(id)).filter(Boolean) : [],
  };
}
