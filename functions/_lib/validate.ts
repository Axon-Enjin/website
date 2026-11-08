import { ARTICLE_TYPES, type ArticleInput, type Block, type Hero } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/;
const YOUTUBE_ID = /^[\w-]{6,20}$/;
const VIMEO_ID = /^\d{6,12}$/;

const CURRENCY = [
  /\$\s?\d/,
  /₱\s?\d/,
  /\bphp\s*\d/i,
  /\busd\s*\d/i,
  /\beur\s*\d/i,
  /\b\d[\d,]*(?:\.\d+)?\s*(?:usd|php|eur|dollars|pesos)\b/i,
];

export function containsCurrency(value: string) {
  return CURRENCY.some((pattern) => pattern.test(value));
}

export function safeHref(href: string) {
  const trimmed = href.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseEmbedUrl(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return YOUTUBE_ID.test(id) ? { provider: "youtube" as const, videoId: id } : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id =
      url.searchParams.get("v") ||
      (parts[0] === "embed" || parts[0] === "shorts" ? parts[1] : "") ||
      "";
    return YOUTUBE_ID.test(id) ? { provider: "youtube" as const, videoId: id } : null;
  }
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop() ?? "";
    return VIMEO_ID.test(id) ? { provider: "vimeo" as const, videoId: id } : null;
  }
  if (host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[0] === "video" ? (parts[1] ?? "") : "";
    return VIMEO_ID.test(id) ? { provider: "vimeo" as const, videoId: id } : null;
  }
  return null;
}

function stringsOf(input: ArticleInput) {
  const values = [
    input.slug,
    input.title,
    input.listTitle,
    input.dek,
    input.card,
    input.result,
    input.byline,
    input.seoTitle,
    input.seoDescription,
    input.hero?.caption ?? "",
    input.hero && input.hero.kind === "image" ? input.hero.alt : "",
  ];
  for (const link of input.links) values.push(link.href, link.label);
  for (const block of input.body) values.push(...blockStrings(block));
  return values;
}

function blockStrings(block: Block) {
  switch (block.type) {
    case "paragraph":
    case "quote":
      return [block.text];
    case "heading":
      return [block.text];
    case "list":
      return block.items;
    case "image":
      return [block.alt, block.caption];
    case "video":
    case "embed":
      return [block.caption];
    default:
      return [];
  }
}

function isWidth(value: unknown): value is "content" | "wide" {
  return value === "content" || value === "wide";
}

function checkBlock(block: Block, errors: string[], index: number) {
  const where = `Block ${index + 1}`;
  if (!block || typeof block !== "object" || typeof block.id !== "string" || !block.id) {
    errors.push(`${where} is missing an id.`);
    return;
  }
  switch (block.type) {
    case "paragraph":
    case "quote":
      if (typeof block.text !== "string") errors.push(`${where} needs text.`);
      break;
    case "heading":
      if (block.level !== 2 && block.level !== 3) errors.push(`${where} heading level must be 2 or 3.`);
      if (typeof block.text !== "string" || !block.text.trim()) errors.push(`${where} heading is empty.`);
      break;
    case "list":
      if (typeof block.ordered !== "boolean" || !Array.isArray(block.items)) {
        errors.push(`${where} list is invalid.`);
      }
      break;
    case "divider":
      break;
    case "image":
      if (!block.mediaId) errors.push(`${where} image has no file.`);
      if (!isWidth(block.width)) errors.push(`${where} image width is invalid.`);
      break;
    case "video":
      if (!block.mediaId) errors.push(`${where} video has no file.`);
      if (!isWidth(block.width)) errors.push(`${where} video width is invalid.`);
      break;
    case "embed":
      if (
        (block.provider !== "youtube" && block.provider !== "vimeo") ||
        !(block.provider === "youtube" ? YOUTUBE_ID : VIMEO_ID).test(block.videoId || "")
      ) {
        errors.push(`${where} embed must be a YouTube or Vimeo link.`);
      }
      if (!isWidth(block.width)) errors.push(`${where} embed width is invalid.`);
      break;
    default:
      errors.push(`${where} has an unknown type.`);
  }
}

function checkHero(hero: Hero | null, errors: string[]) {
  if (!hero) return;
  if (hero.kind === "image") {
    if (!hero.mediaId) errors.push("The hero image has no file.");
    return;
  }
  if (hero.kind === "video") {
    if (!hero.mediaId) errors.push("The hero video has no file.");
    return;
  }
  errors.push("The hero block is invalid.");
}

export function validateArticle(input: ArticleInput, mode: "save" | "publish") {
  const errors: string[] = [];
  if (!input.title.trim()) errors.push("Add a title.");
  if (!SLUG.test(input.slug)) {
    errors.push("The slug needs lowercase words, hyphens, and a .html ending.");
  }
  if (!ARTICLE_TYPES.includes(input.type as (typeof ARTICLE_TYPES)[number])) {
    errors.push("Choose Think, Build, Operate, or Case.");
  }
  if (input.cardArt && !input.cardArt.startsWith("/assets/") && !input.cardArt.startsWith("/media/")) {
    errors.push("Card art must be a path on this site.");
  }
  if (!Array.isArray(input.body)) errors.push("The article body is missing.");
  else input.body.forEach((block, index) => checkBlock(block, errors, index));
  checkHero(input.hero, errors);
  if (!Array.isArray(input.links)) errors.push("Links are invalid.");
  else if (input.links.length > 8) errors.push("Use eight end links or fewer.");
  else {
    input.links.forEach((link, index) => {
      if (!link.label.trim()) errors.push(`End link ${index + 1} needs a label.`);
      if (!safeHref(link.href)) errors.push(`End link ${index + 1} needs an http(s) or site URL.`);
    });
  }
  for (const value of stringsOf(input)) {
    if (containsCurrency(value)) {
      errors.push("Remove currency amounts before this can be saved. The public site does not show them.");
      break;
    }
  }
  if (mode === "save") return errors;

  if (!input.dek.trim()) errors.push("Add the index summary.");
  if (!input.authorIds.length) errors.push("Choose at least one author.");
  if (input.hero?.kind === "image" && !input.hero.alt.trim()) errors.push("The hero image needs alt text.");
  if (input.hero?.kind === "video" && !input.hero.posterId) errors.push("The hero video needs a poster image.");
  input.body.forEach((block, index) => {
    if (block.type === "image" && !block.alt.trim()) errors.push(`Block ${index + 1} image needs alt text.`);
    if (block.type === "video" && !block.posterId) errors.push(`Block ${index + 1} video needs a poster image.`);
  });
  return errors;
}

export function slugify(title: string) {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "article"}.html`;
}
