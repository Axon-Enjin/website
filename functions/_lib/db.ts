import { newId } from "./auth";
import type { ArticleInput, ArticleRecord, ArticleStatus, Block, Env, Hero, MediaRecord } from "./types";

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  list_title: string;
  dek: string;
  card: string;
  result: string;
  card_art: string;
  type: string;
  status: ArticleStatus;
  byline: string;
  body: string;
  hero: string | null;
  links: string;
  seo_title: string;
  seo_description: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toArticle(row: ArticleRow, authorIds: string[]): ArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    listTitle: row.list_title,
    dek: row.dek,
    card: row.card,
    result: row.result,
    cardArt: row.card_art,
    type: row.type,
    status: row.status,
    byline: row.byline,
    body: parseJson<Block[]>(row.body, []),
    hero: parseJson<Hero | null>(row.hero, null),
    links: parseJson(row.links, []),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    authorIds,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

async function authorIds(env: Env, articleId: string) {
  const rows = await env.DB.prepare(
    "SELECT user_id FROM article_authors WHERE article_id = ? ORDER BY position ASC",
  )
    .bind(articleId)
    .all<{ user_id: string }>();
  return (rows.results ?? []).map((row) => row.user_id);
}

export async function getArticle(env: Env, id: string) {
  const row = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(id).first<ArticleRow>();
  if (!row) return null;
  return toArticle(row, await authorIds(env, id));
}

export async function getArticleBySlug(env: Env, slug: string) {
  const row = await env.DB.prepare("SELECT * FROM articles WHERE slug = ?").bind(slug).first<ArticleRow>();
  if (!row) return null;
  return toArticle(row, await authorIds(env, row.id));
}

export async function listArticles(env: Env, filter: { status?: string; type?: string; q?: string }) {
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (filter.status) {
    clauses.push("status = ?");
    values.push(filter.status);
  }
  if (filter.type) {
    clauses.push("type = ?");
    values.push(filter.type);
  }
  if (filter.q) {
    clauses.push("(title LIKE ? OR list_title LIKE ? OR dek LIKE ?)");
    const like = `%${filter.q.replaceAll("%", "")}%`;
    values.push(like, like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await env.DB.prepare(
    `SELECT * FROM articles ${where} ORDER BY updated_at DESC`,
  )
    .bind(...values)
    .all<ArticleRow>();
  const articles: ArticleRecord[] = [];
  for (const row of rows.results ?? []) articles.push(toArticle(row, await authorIds(env, row.id)));
  return articles;
}

export async function listPublished(env: Env) {
  const rows = await env.DB.prepare(
    "SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC, updated_at DESC",
  ).all<ArticleRow>();
  const articles: ArticleRecord[] = [];
  for (const row of rows.results ?? []) articles.push(toArticle(row, await authorIds(env, row.id)));
  return articles;
}

function snapshot(article: ArticleRecord) {
  const { id: _id, createdAt: _created, updatedAt: _updated, createdBy: _by, updatedBy: _editor, ...input } = article;
  return JSON.stringify(input);
}

async function writeAuthors(env: Env, articleId: string, ids: string[]) {
  await env.DB.prepare("DELETE FROM article_authors WHERE article_id = ?").bind(articleId).run();
  let position = 0;
  for (const userId of ids) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO article_authors (article_id, user_id, position) VALUES (?, ?, ?)",
    )
      .bind(articleId, userId, position)
      .run();
    position += 1;
  }
}

async function writeRevision(env: Env, article: ArticleRecord, editorId: string) {
  await env.DB.prepare(
    "INSERT INTO revisions (id, article_id, editor_id, snapshot, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(newId(), article.id, editorId, snapshot(article), article.updatedAt)
    .run();
  const stale = await env.DB.prepare(
    "SELECT id FROM revisions WHERE article_id = ? ORDER BY created_at DESC",
  )
    .bind(article.id)
    .all<{ id: string }>();
  const extra = (stale.results ?? []).slice(30);
  for (const row of extra) await env.DB.prepare("DELETE FROM revisions WHERE id = ?").bind(row.id).run();
}

export async function insertArticle(env: Env, input: ArticleInput, editorId: string) {
  const now = new Date().toISOString();
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO articles (
      id, slug, title, list_title, dek, card, result, card_art, type, status, byline,
      body, hero, links, seo_title, seo_description, published_at, created_at, updated_at, created_by, updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      input.slug,
      input.title,
      input.listTitle,
      input.dek,
      input.card,
      input.result,
      input.cardArt,
      input.type,
      input.byline,
      JSON.stringify(input.body),
      input.hero ? JSON.stringify(input.hero) : null,
      JSON.stringify(input.links),
      input.seoTitle,
      input.seoDescription,
      now,
      now,
      editorId,
      editorId,
    )
    .run();
  await writeAuthors(env, id, input.authorIds);
  const article = await getArticle(env, id);
  if (article) await writeRevision(env, article, editorId);
  return article;
}

export async function updateArticle(env: Env, current: ArticleRecord, input: ArticleInput, editorId: string) {
  const now = new Date().toISOString();
  if (current.status === "published" && current.slug !== input.slug) {
    await env.DB.prepare(
      "INSERT OR REPLACE INTO redirects (from_path, to_path) VALUES (?, ?)",
    )
      .bind(`/articles/${current.slug}`, `/articles/${input.slug}`)
      .run();
  }
  await env.DB.prepare(
    `UPDATE articles SET slug = ?, title = ?, list_title = ?, dek = ?, card = ?, result = ?, card_art = ?,
      type = ?, byline = ?, body = ?, hero = ?, links = ?, seo_title = ?, seo_description = ?, updated_at = ?, updated_by = ?
     WHERE id = ?`,
  )
    .bind(
      input.slug,
      input.title,
      input.listTitle,
      input.dek,
      input.card,
      input.result,
      input.cardArt,
      input.type,
      input.byline,
      JSON.stringify(input.body),
      input.hero ? JSON.stringify(input.hero) : null,
      JSON.stringify(input.links),
      input.seoTitle,
      input.seoDescription,
      now,
      editorId,
      current.id,
    )
    .run();
  await writeAuthors(env, current.id, input.authorIds);
  const article = await getArticle(env, current.id);
  if (article) await writeRevision(env, article, editorId);
  return article;
}

export async function setStatus(env: Env, article: ArticleRecord, status: ArticleStatus, editorId: string) {
  const now = new Date().toISOString();
  const publishedAt = status === "published" ? article.publishedAt || now : article.publishedAt;
  await env.DB.prepare(
    "UPDATE articles SET status = ?, published_at = ?, updated_at = ?, updated_by = ? WHERE id = ?",
  )
    .bind(status, publishedAt, now, editorId, article.id)
    .run();
  if (status !== "published") {
    await env.DB.prepare("DELETE FROM homepage_picks WHERE article_id = ?").bind(article.id).run();
  }
  return getArticle(env, article.id);
}

export async function listRevisions(env: Env, articleId: string) {
  const rows = await env.DB.prepare(
    `SELECT revisions.id, revisions.created_at, users.name AS editor
     FROM revisions LEFT JOIN users ON users.id = revisions.editor_id
     WHERE revisions.article_id = ? ORDER BY revisions.created_at DESC LIMIT 30`,
  )
    .bind(articleId)
    .all<{ id: string; created_at: string; editor: string | null }>();
  return (rows.results ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    editor: row.editor,
  }));
}

export async function restoreRevision(env: Env, articleId: string, revisionId: string, editorId: string) {
  const row = await env.DB.prepare(
    "SELECT snapshot FROM revisions WHERE id = ? AND article_id = ?",
  )
    .bind(revisionId, articleId)
    .first<{ snapshot: string }>();
  if (!row) return null;
  const input = JSON.parse(row.snapshot) as ArticleInput;
  const current = await getArticle(env, articleId);
  if (!current) return null;
  return updateArticle(env, current, input, editorId);
}

export async function listMedia(env: Env) {
  const rows = await env.DB.prepare(
    "SELECT * FROM media ORDER BY created_at DESC",
  ).all<{
    id: string;
    kind: "image" | "video";
    mime: string;
    bytes: number;
    width: number | null;
    height: number | null;
    alt: string;
    original_name: string;
    created_at: string;
  }>();
  return (rows.results ?? []).map(
    (row): MediaRecord => ({
      id: row.id,
      kind: row.kind,
      mime: row.mime,
      bytes: row.bytes,
      width: row.width,
      height: row.height,
      alt: row.alt,
      originalName: row.original_name,
      createdAt: row.created_at,
    }),
  );
}

export async function mediaInUse(env: Env, mediaId: string) {
  const rows = await env.DB.prepare("SELECT body, hero FROM articles").all<{ body: string; hero: string | null }>();
  return (rows.results ?? []).some((row) => `${row.body} ${row.hero ?? ""}`.includes(mediaId));
}

export async function homepageArticles(env: Env) {
  const picks = await env.DB.prepare(
    `SELECT articles.* FROM homepage_picks
     JOIN articles ON articles.id = homepage_picks.article_id
     WHERE articles.status = 'published'
     ORDER BY homepage_picks.position ASC`,
  ).all<ArticleRow>();
  const picked = picks.results ?? [];
  if (picked.length) {
    const articles: ArticleRecord[] = [];
    for (const row of picked) articles.push(toArticle(row, await authorIds(env, row.id)));
    return articles;
  }
  const published = await listPublished(env);
  return published.slice(0, 3);
}
