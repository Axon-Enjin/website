export const SCHEMA = `CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  csrf TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bucket TEXT NOT NULL,
  attempted_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  list_title TEXT NOT NULL DEFAULT '',
  dek TEXT NOT NULL DEFAULT '',
  card TEXT NOT NULL DEFAULT '',
  result TEXT NOT NULL DEFAULT '',
  card_art TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  byline TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  hero TEXT,
  links TEXT NOT NULL DEFAULT '[]',
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS article_authors (
  article_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (article_id, user_id)
);

CREATE TABLE IF NOT EXISTS revisions (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  editor_id TEXT,
  snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  mime TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt TEXT NOT NULL DEFAULT '',
  original_name TEXT NOT NULL DEFAULT '',
  created_by TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS redirects (
  from_path TEXT PRIMARY KEY,
  to_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS homepage_picks (
  position INTEGER PRIMARY KEY,
  article_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS articles_status_published ON articles (status, published_at);
CREATE INDEX IF NOT EXISTS revisions_article ON revisions (article_id, created_at);
CREATE INDEX IF NOT EXISTS login_attempts_bucket ON login_attempts (bucket, attempted_at);
`;
