import { hashPassword } from "./auth";
import { SCHEMA } from "./schema";
import seedArticles from "./seed-articles.json";
import { DEFAULT_FOUNDERS, type BoundEnv, type Env, type Founder } from "./types";

type SeedArticle = (typeof seedArticles)[number];

let ready: Promise<void> | null = null;

function founders(env: BoundEnv): Founder[] {
  if (!env.FOUNDER_ACCOUNTS) return DEFAULT_FOUNDERS;
  try {
    const parsed = JSON.parse(env.FOUNDER_ACCOUNTS) as Founder[];
    if (Array.isArray(parsed) && parsed.every((item) => item.email && item.name)) return parsed;
  } catch {
    console.error("FOUNDER_ACCOUNTS is not valid JSON. Using the default founder list.");
  }
  return DEFAULT_FOUNDERS;
}

async function seed(env: BoundEnv) {
  await env.DB.prepare("INSERT OR IGNORE INTO redirects (from_path, to_path) VALUES (?, ?)").bind(
    "/articles/kpmg-academic-innovation.html",
    "/articles/kpmg.html",
  ).run();
  if (!env.FOUNDER_PASSWORD) return;

  const existingUsers = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first<{ count: number }>();
  if (!existingUsers?.count) {
    const now = new Date().toISOString();
    let position = 0;
    for (const founder of founders(env)) {
      const hash = await hashPassword(env.FOUNDER_PASSWORD);
      await env.DB.prepare(
        "INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
      )
        .bind(`user-${position}`, founder.email.toLowerCase(), founder.name, hash, now)
        .run();
      position += 1;
    }
  }

  const existingArticles = await env.DB.prepare("SELECT COUNT(*) AS count FROM articles").first<{ count: number }>();
  if (existingArticles?.count) return;

  const users = await env.DB.prepare("SELECT id, name FROM users ORDER BY id ASC").all<{ id: string; name: string }>();
  const authorIds = (users.results ?? []).map((user) => user.id);
  for (const article of seedArticles as SeedArticle[]) {
    const id = `seed-${article.slug.replace(/\.html$/, "")}`;
    await env.DB.prepare(
      `INSERT INTO articles (
        id, slug, title, list_title, dek, card, result, card_art, type, status, byline,
        body, hero, links, seo_title, seo_description, published_at, created_at, updated_at, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        article.slug,
        article.title,
        article.listTitle,
        article.dek,
        article.card,
        article.result,
        article.cardArt,
        article.type,
        article.byline,
        JSON.stringify(article.body),
        JSON.stringify(article.links),
        article.seoTitle,
        article.seoDescription,
        article.publishedAt,
        article.publishedAt,
        article.publishedAt,
        authorIds[0] ?? null,
        authorIds[0] ?? null,
      )
      .run();
    let position = 0;
    for (const userId of authorIds) {
      await env.DB.prepare(
        "INSERT INTO article_authors (article_id, user_id, position) VALUES (?, ?, ?)",
      )
        .bind(id, userId, position)
        .run();
      position += 1;
    }
  }

  const picks = ["seed-started", "seed-axial", "seed-kpmg"];
  let position = 0;
  for (const articleId of picks) {
    await env.DB.prepare("INSERT INTO homepage_picks (position, article_id) VALUES (?, ?)").bind(position, articleId).run();
    position += 1;
  }
}

async function migrate(env: BoundEnv) {
  const statements = SCHEMA.split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) await env.DB.prepare(statement).run();
  await seed(env);
}

export function bootstrap(env: Env) {
  if (!env.DB) return Promise.resolve();
  const bound = env as BoundEnv;
  if (!ready) {
    ready = migrate(bound).catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}
