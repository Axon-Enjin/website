export const ARTICLE_TYPES = ["Think", "Build", "Operate", "Case"] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];
export type ArticleStatus = "draft" | "published" | "archived";
export type FigureWidth = "content" | "wide";

export type Hero =
  | { kind: "image"; mediaId: string; alt: string; caption: string }
  | { kind: "video"; mediaId: string; posterId: string; caption: string };

export type ArticleLink = { href: string; label: string };

export type Block =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "quote"; text: string }
  | { id: string; type: "divider" }
  | {
      id: string;
      type: "image";
      mediaId: string;
      alt: string;
      caption: string;
      width: FigureWidth;
    }
  | {
      id: string;
      type: "video";
      mediaId: string;
      posterId: string;
      caption: string;
      width: FigureWidth;
    }
  | {
      id: string;
      type: "embed";
      provider: "youtube" | "vimeo";
      videoId: string;
      caption: string;
      width: FigureWidth;
    };

export type ArticleInput = {
  slug: string;
  title: string;
  listTitle: string;
  dek: string;
  card: string;
  result: string;
  cardArt: string;
  type: string;
  byline: string;
  body: Block[];
  hero: Hero | null;
  links: ArticleLink[];
  seoTitle: string;
  seoDescription: string;
  authorIds: string[];
};

export type ArticleRecord = ArticleInput & {
  id: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type MediaRecord = {
  id: string;
  kind: "image" | "video";
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  alt: string;
  originalName: string;
  createdAt: string;
};

export type PublicStory = {
  title: string;
  result: string;
  type: string;
  description: string;
  href: string;
  art: string;
};

export type Founder = { email: string; name: string };

export const DEFAULT_FOUNDERS: Founder[] = [
  { email: "jerico@axonenjin.com", name: "Carlos Jerico Dela Torre" },
  { email: "aidan@axonenjin.com", name: "Aidan Tiu" },
  { email: "rhandie@axonenjin.com", name: "Rhandie Sales Jr." },
  { email: "gerald@axonenjin.com", name: "Gerald Berongoy" },
];

export type D1Result<T = unknown> = { results?: T[] };

export type D1Prepared = {
  bind(...values: unknown[]): D1Prepared;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
};

export type D1Database = {
  prepare(query: string): D1Prepared;
  exec(query: string): Promise<unknown>;
};

export type R2Object = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  size: number;
};

export type R2Bucket = {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  get(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
};

export type AssetFetcher = {
  fetch(input: Request | string): Promise<Response>;
};

export type Env = {
  DB?: D1Database;
  MEDIA?: R2Bucket;
  ASSETS: AssetFetcher;
  FOUNDER_PASSWORD?: string;
  FOUNDER_ACCOUNTS?: string;
};

export type BoundEnv = Env & {
  DB: D1Database;
  MEDIA: R2Bucket;
};
