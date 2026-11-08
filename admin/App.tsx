import { useEffect, useState } from "react";
import { parseEmbedUrl, slugify, validateArticle } from "../functions/_lib/validate";
import type { ArticleLink, ArticleRecord, Block, Hero } from "../functions/_lib/types";
import { ApiError, api, setCsrf, uploadImage, uploadVideo, type MediaItem, type Person } from "./api";

type Session = { user: Person; founders: Person[] };
type Screen = "articles" | "editor" | "media" | "home";

function manila(iso: string | null) {
  if (!iso) return "Not published";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function blank(authorId = ""): ArticleRecord {
  return {
    id: "",
    slug: "",
    title: "",
    listTitle: "",
    dek: "",
    card: "",
    result: "",
    cardArt: "",
    type: "Think",
    status: "draft",
    byline: "",
    body: [{ id: crypto.randomUUID(), type: "paragraph", text: "" }],
    hero: null,
    links: [],
    seoTitle: "",
    seoDescription: "",
    authorIds: authorId ? [authorId] : [],
    publishedAt: null,
    createdAt: "",
    updatedAt: "",
    createdBy: null,
    updatedBy: null,
  };
}

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("articles");
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    api<{ user: Person; csrf: string; founders: Person[] }>("/api/admin/me")
      .then((data) => {
        setCsrf(data.csrf);
        setSession({ user: data.user, founders: data.founders });
      })
      .catch(() => setSession(null))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <p className="admin-status">Loading the desk…</p>;
  if (!session) return <Login onSuccess={setSession} />;

  function openArticle(id: string | null) {
    setEditing(id);
    setScreen("editor");
  }

  return (
    <div className="admin-shell">
      <header className="admin-bar">
        <a className="brand" href="/">
          <img src="/assets/axon-mark.svg" width="32" height="22" alt="" />
          <span>AXON ENJIN</span>
        </a>
        <nav>
          <button type="button" className={screen === "articles" || screen === "editor" ? "is-current" : ""} onClick={() => setScreen("articles")}>Articles</button>
          <button type="button" className={screen === "media" ? "is-current" : ""} onClick={() => setScreen("media")}>Media</button>
          <button type="button" className={screen === "home" ? "is-current" : ""} onClick={() => setScreen("home")}>Homepage</button>
        </nav>
        <span>{session.user.name}</span>
        <button
          type="button"
          className="admin-quiet"
          onClick={() => api("/api/admin/logout", { method: "POST" }).finally(() => setSession(null))}
        >
          Sign out
        </button>
      </header>
      {screen === "articles" ? <ArticleList onOpen={openArticle} /> : null}
      {screen === "editor" ? (
        <Editor
          key={editing ?? "new"}
          articleId={editing}
          founders={session.founders}
          user={session.user}
          onBack={() => setScreen("articles")}
        />
      ) : null}
      {screen === "media" ? <MediaLibrary /> : null}
      {screen === "home" ? <HomepagePicks /> : null}
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <main className="admin-login">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          api<{ user: Person; csrf: string; founders: Person[] }>("/api/admin/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          })
            .then((data) => {
              setCsrf(data.csrf);
              onSuccess({ user: data.user, founders: data.founders });
            })
            .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Sign-in failed."))
            .finally(() => setPending(false));
        }}
      >
        <p className="article-type">Admin</p>
        <h1>Sign in</h1>
        <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error ? <p className="admin-error">{error}</p> : null}
        <button className="button" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}

function ArticleList({ onOpen }: { onOpen: (id: string | null) => void }) {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function load(nextQuery = query, nextStatus = status) {
    const params = new URLSearchParams();
    if (nextQuery) params.set("q", nextQuery);
    if (nextStatus) params.set("status", nextStatus);
    api<{ articles: ArticleRecord[] }>(`/api/admin/articles?${params}`)
      .then((data) => setArticles(data.articles))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load articles."));
  }

  useEffect(() => {
    load();
    // The first list is the unfiltered desk.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="admin-main">
      <div className="admin-heading">
        <h1>Articles</h1>
        <button className="button" type="button" onClick={() => onOpen(null)}>New article</button>
      </div>
      <div className="admin-filters">
        <input placeholder="Search titles" value={query} onChange={(event) => { setQuery(event.target.value); load(event.target.value, status); }} />
        <select value={status} onChange={(event) => { setStatus(event.target.value); load(query, event.target.value); }}>
          <option value="">All statuses</option>
          <option>draft</option>
          <option>published</option>
          <option>archived</option>
        </select>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <ul className="admin-list">
        {articles.map((article) => (
          <li key={article.id}>
            <button type="button" onClick={() => onOpen(article.id)}>
              <strong>{article.listTitle || article.title || "Untitled"}</strong>
              <span>{article.type}</span>
              <span>{article.status}</span>
              <span>{manila(article.updatedAt)}</span>
            </button>
          </li>
        ))}
      </ul>
      {!articles.length && !error ? <p className="admin-status">No articles in this view.</p> : null}
    </main>
  );
}

function Editor({ articleId, founders, user, onBack }: { articleId: string | null; founders: Person[]; user: Person; onBack: () => void }) {
  const [article, setArticle] = useState<ArticleRecord>(() => blank(user.id));
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [revisions, setRevisions] = useState<{ id: string; createdAt: string; editor: string | null }[]>([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(articleId));

  useEffect(() => {
    api<{ media: MediaItem[] }>("/api/admin/media").then((data) => setMedia(data.media)).catch(() => undefined);
    if (!articleId) return;
    api<{ article: ArticleRecord }>(`/api/admin/articles/${articleId}`).then((data) => setArticle(data.article)).catch((reason: unknown) => {
      setErrors([reason instanceof Error ? reason.message : "Could not open that article."]);
    });
    api<{ revisions: { id: string; createdAt: string; editor: string | null }[] }>(`/api/admin/articles/${articleId}/revisions`)
      .then((data) => setRevisions(data.revisions))
      .catch(() => undefined);
  }, [articleId]);

  function patch(partial: Partial<ArticleRecord>) {
    setArticle((current) => {
      const next = { ...current, ...partial };
      if (!slugTouched && partial.title !== undefined) next.slug = slugify(partial.title);
      return next;
    });
  }

  async function save() {
    const errorsNow = validateArticle(article, article.status === "published" ? "publish" : "save");
    setErrors(errorsNow);
    if (errorsNow.length) return null;
    const payload = JSON.stringify(article);
    const data = article.id
      ? await api<{ article: ArticleRecord }>(`/api/admin/articles/${article.id}`, { method: "PUT", body: payload })
      : await api<{ article: ArticleRecord }>("/api/admin/articles", { method: "POST", body: payload });
    setArticle(data.article);
    setNotice("Saved");
    return data.article;
  }

  async function act(action: "publish" | "unpublish" | "archive") {
    setNotice("");
    try {
      const saved = action === "publish" ? await save() : article.id ? article : await save();
      if (!saved) return;
      if (action === "publish") {
        const problems = validateArticle(saved, "publish");
        setErrors(problems);
        if (problems.length) return;
      }
      const data = await api<{ article: ArticleRecord }>(`/api/admin/articles/${saved.id}/${action}`, { method: "POST" });
      setArticle(data.article);
      setNotice(action === "publish" ? "Published" : action === "archive" ? "Archived" : "Unpublished");
    } catch (reason) {
      const error = reason instanceof ApiError ? reason : null;
      setErrors(error?.errors.length ? error.errors : [reason instanceof Error ? reason.message : "Could not update the article."]);
    }
  }

  return (
    <main className="admin-editor">
      <div className="admin-heading">
        <button className="admin-quiet" type="button" onClick={onBack}>All articles</button>
        <h1>{article.listTitle || article.title || "New article"}</h1>
        <div className="admin-actions">
          <button className="admin-quiet" type="button" onClick={() => save().catch((reason: unknown) => setErrors([reason instanceof Error ? reason.message : "Save failed."]))}>Save draft</button>
          {article.id ? <a className="admin-quiet" href={`/api/admin/articles/${article.id}/preview`} target="_blank" rel="noreferrer">Preview</a> : null}
          <button className="button" type="button" onClick={() => act("publish")}>{article.status === "published" ? "Update" : "Publish"}</button>
        </div>
      </div>
      {notice ? <p className="admin-notice">{notice}</p> : null}
      {errors.length ? <ul className="admin-error">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
      <div className="admin-editor-grid">
        <div>
          <label>Title<input value={article.title} onChange={(event) => patch({ title: event.target.value })} /></label>
          <label>Index title<input value={article.listTitle} onChange={(event) => patch({ listTitle: event.target.value })} /></label>
          <label>Byline<input value={article.byline} onChange={(event) => patch({ byline: event.target.value })} /></label>
          <BlockList article={article} media={media} onChange={patch} onMedia={setMedia} />
          <LinkList links={article.links} onChange={(links) => patch({ links })} />
        </div>
        <aside>
          <label>Type
            <select value={article.type} onChange={(event) => patch({ type: event.target.value })}>
              {["Think", "Build", "Operate", "Case"].map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label>URL slug
            <input value={article.slug} onChange={(event) => { setSlugTouched(true); patch({ slug: event.target.value }); }} />
          </label>
          <p className="admin-help">Status: {article.status}. Updated {manila(article.updatedAt)} Manila.</p>
          <fieldset>
            <legend>Authors</legend>
            {founders.map((founder) => (
              <label key={founder.id} className="admin-check">
                <input
                  type="checkbox"
                  checked={article.authorIds.includes(founder.id)}
                  onChange={(event) => {
                    const authorIds = event.target.checked
                      ? [...article.authorIds, founder.id]
                      : article.authorIds.filter((id) => id !== founder.id);
                    patch({ authorIds });
                  }}
                />
                {founder.name}
              </label>
            ))}
          </fieldset>
          <label>Index summary<textarea value={article.dek} onChange={(event) => patch({ dek: event.target.value })} /></label>
          <label>Homepage card<textarea value={article.card} onChange={(event) => patch({ card: event.target.value })} /></label>
          <label>Proof line<input value={article.result} onChange={(event) => patch({ result: event.target.value })} /></label>
          <label>Card image path<input value={article.cardArt} onChange={(event) => patch({ cardArt: event.target.value })} placeholder="/assets/hero-network.png" /></label>
          <HeroField hero={article.hero} media={media} onChange={(hero) => patch({ hero })} onMedia={setMedia} />
          <label>SEO title<input value={article.seoTitle} onChange={(event) => patch({ seoTitle: event.target.value })} /></label>
          <label>SEO description<textarea value={article.seoDescription} onChange={(event) => patch({ seoDescription: event.target.value })} /></label>
          {article.status === "published" ? <button className="admin-quiet" type="button" onClick={() => act("unpublish")}>Unpublish</button> : null}
          {article.status !== "archived" ? <button className="admin-quiet" type="button" onClick={() => act("archive")}>Archive</button> : null}
          {article.id && article.status !== "published" ? (
            <button
              className="admin-quiet"
              type="button"
              onClick={() => {
                if (!confirm("Delete this draft?")) return;
                api(`/api/admin/articles/${article.id}`, { method: "DELETE" }).then(onBack).catch((reason: unknown) => {
                  setErrors([reason instanceof Error ? reason.message : "Could not delete it."]);
                });
              }}
            >
              Delete draft
            </button>
          ) : null}
          {revisions.length ? (
            <fieldset>
              <legend>Revisions</legend>
              <ul className="admin-revisions">
                {revisions.map((revision) => (
                  <li key={revision.id}>
                    <span>{manila(revision.createdAt)} · {revision.editor ?? "Someone"}</span>
                    <button
                      type="button"
                      className="admin-quiet"
                      onClick={() => {
                        api<{ article: ArticleRecord }>(`/api/admin/articles/${article.id}/restore`, {
                          method: "POST",
                          body: JSON.stringify({ revisionId: revision.id }),
                        }).then((data) => {
                          setArticle(data.article);
                          setNotice("Restored as a new save");
                        }).catch((reason: unknown) => setErrors([reason instanceof Error ? reason.message : "Could not restore."]));
                      }}
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

function BlockList({ article, media, onChange, onMedia }: { article: ArticleRecord; media: MediaItem[]; onChange: (partial: Partial<ArticleRecord>) => void; onMedia: (items: MediaItem[]) => void }) {
  function update(body: Block[]) {
    onChange({ body });
  }
  function add(type: Block["type"]) {
    const id = crypto.randomUUID();
    const block: Block =
      type === "heading" ? { id, type, level: 2, text: "" }
      : type === "list" ? { id, type, ordered: false, items: [""] }
      : type === "quote" ? { id, type, text: "" }
      : type === "divider" ? { id, type }
      : type === "image" ? { id, type, mediaId: "", alt: "", caption: "", width: "content" }
      : type === "video" ? { id, type, mediaId: "", posterId: "", caption: "", width: "content" }
      : type === "embed" ? { id, type, provider: "youtube", videoId: "", caption: "", width: "content" }
      : { id, type: "paragraph", text: "" };
    update([...article.body, block]);
  }
  return (
    <div className="admin-blocks">
      {article.body.map((block, index) => (
        <article key={block.id} className="admin-block">
          <header>
            <span>{block.type}</span>
            <button type="button" onClick={() => update(move(article.body, index, -1))} disabled={index === 0}>Up</button>
            <button type="button" onClick={() => update(move(article.body, index, 1))} disabled={index === article.body.length - 1}>Down</button>
            <button type="button" onClick={() => update(article.body.filter((item) => item.id !== block.id))}>Remove</button>
          </header>
          <BlockFields
            block={block}
            media={media}
            onMedia={onMedia}
            onChange={(next) => update(article.body.map((item) => (item.id === block.id ? next : item)))}
          />
        </article>
      ))}
      <div className="admin-add">
        {(["paragraph", "heading", "list", "quote", "divider", "image", "video", "embed"] as const).map((type) => (
          <button key={type} type="button" onClick={() => add(type)}>{type}</button>
        ))}
      </div>
    </div>
  );
}

function BlockFields({ block, media, onChange, onMedia }: { block: Block; media: MediaItem[]; onChange: (block: Block) => void; onMedia: (items: MediaItem[]) => void }) {
  if (block.type === "paragraph" || block.type === "quote") {
    return <textarea value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} />;
  }
  if (block.type === "heading") {
    return (
      <>
        <select value={block.level} onChange={(event) => onChange({ ...block, level: Number(event.target.value) === 3 ? 3 : 2 })}>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
        </select>
        <input value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} />
      </>
    );
  }
  if (block.type === "list") {
    return (
      <>
        <label className="admin-check"><input type="checkbox" checked={block.ordered} onChange={(event) => onChange({ ...block, ordered: event.target.checked })} /> Numbered</label>
        {block.items.map((item, index) => (
          <input key={index} value={item} onChange={(event) => onChange({ ...block, items: block.items.map((entry, itemIndex) => itemIndex === index ? event.target.value : entry) })} />
        ))}
        <button type="button" onClick={() => onChange({ ...block, items: [...block.items, ""] })}>Add item</button>
      </>
    );
  }
  if (block.type === "divider") return <hr />;
  if (block.type === "image") {
    return (
      <>
        <MediaPick kind="image" media={media} selected={block.mediaId} onMedia={onMedia} onSelect={(mediaId) => onChange({ ...block, mediaId })} />
        {block.mediaId ? <img src={`/media/${block.mediaId}`} alt="" /> : null}
        <input placeholder="Alt text" value={block.alt} onChange={(event) => onChange({ ...block, alt: event.target.value })} />
        <input placeholder="Caption" value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} />
        <Width value={block.width} onChange={(width) => onChange({ ...block, width })} />
      </>
    );
  }
  if (block.type === "video") {
    return (
      <>
        <MediaPick kind="video" media={media} selected={block.mediaId} onMedia={onMedia} onSelect={(mediaId) => onChange({ ...block, mediaId })} />
        <MediaPick kind="image" media={media} selected={block.posterId} onMedia={onMedia} onSelect={(posterId) => onChange({ ...block, posterId })} label="Poster" />
        <input placeholder="Caption" value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} />
        <Width value={block.width} onChange={(width) => onChange({ ...block, width })} />
      </>
    );
  }
  return (
    <>
      <input
        placeholder="YouTube or Vimeo URL"
        defaultValue={block.videoId ? `https://${block.provider === "youtube" ? "youtu.be" : "vimeo.com"}/${block.videoId}` : ""}
        onBlur={(event) => {
          const parsed = parseEmbedUrl(event.target.value);
          if (!parsed) {
            onChange({ ...block, videoId: "" });
            return;
          }
          onChange({ ...block, provider: parsed.provider, videoId: parsed.videoId });
        }}
      />
      {block.videoId ? <p className="admin-help">{block.provider}: {block.videoId}</p> : <p className="admin-help">Paste a normal watch link.</p>}
      <input placeholder="Caption" value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} />
      <Width value={block.width} onChange={(width) => onChange({ ...block, width })} />
    </>
  );
}

function Width({ value, onChange }: { value: "content" | "wide"; onChange: (value: "content" | "wide") => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value === "wide" ? "wide" : "content")}>
      <option value="content">Column width</option>
      <option value="wide">Wide</option>
    </select>
  );
}

function MediaPick({ kind, media, selected, onSelect, onMedia, label = "File" }: { kind: "image" | "video"; media: MediaItem[]; selected: string; onSelect: (id: string) => void; onMedia: (items: MediaItem[]) => void; label?: string }) {
  const [error, setError] = useState("");
  return (
    <label>{label}
      <span className="admin-media-row">
        <select value={selected} onChange={(event) => onSelect(event.target.value)}>
          <option value="">Choose</option>
          {media.filter((item) => item.kind === kind).map((item) => (
            <option key={item.id} value={item.id}>{item.originalName || item.id}</option>
          ))}
        </select>
        <input
          type="file"
          accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4"}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setError("");
            const task = kind === "image" ? uploadImage(file, "") : uploadVideo(file);
            task.then((data) => {
              onMedia([data.media, ...media]);
              onSelect(data.media.id);
            }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Upload failed."));
          }}
        />
      </span>
      {error ? <span className="admin-error">{error}</span> : null}
    </label>
  );
}

function HeroField({ hero, media, onChange, onMedia }: { hero: Hero | null; media: MediaItem[]; onChange: (hero: Hero | null) => void; onMedia: (items: MediaItem[]) => void }) {
  const kind = hero?.kind ?? "none";
  return (
    <fieldset>
      <legend>Hero</legend>
      <select
        value={kind}
        onChange={(event) => {
          if (event.target.value === "image") onChange({ kind: "image", mediaId: "", alt: "", caption: "" });
          else if (event.target.value === "video") onChange({ kind: "video", mediaId: "", posterId: "", caption: "" });
          else onChange(null);
        }}
      >
        <option value="none">None</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>
      {hero?.kind === "image" ? (
        <>
          <MediaPick kind="image" media={media} selected={hero.mediaId} onMedia={onMedia} onSelect={(mediaId) => onChange({ ...hero, mediaId })} />
          <input placeholder="Alt text" value={hero.alt} onChange={(event) => onChange({ ...hero, alt: event.target.value })} />
          <input placeholder="Caption" value={hero.caption} onChange={(event) => onChange({ ...hero, caption: event.target.value })} />
        </>
      ) : null}
      {hero?.kind === "video" ? (
        <>
          <MediaPick kind="video" media={media} selected={hero.mediaId} onMedia={onMedia} onSelect={(mediaId) => onChange({ ...hero, mediaId })} />
          <MediaPick kind="image" media={media} selected={hero.posterId} onMedia={onMedia} onSelect={(posterId) => onChange({ ...hero, posterId })} label="Poster" />
          <input placeholder="Caption" value={hero.caption} onChange={(event) => onChange({ ...hero, caption: event.target.value })} />
        </>
      ) : null}
    </fieldset>
  );
}

function LinkList({ links, onChange }: { links: ArticleLink[]; onChange: (links: ArticleLink[]) => void }) {
  return (
    <fieldset>
      <legend>End links</legend>
      {links.map((link, index) => (
        <div key={index} className="admin-link-row">
          <input placeholder="Label" value={link.label} onChange={(event) => onChange(links.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} />
          <input placeholder="https://" value={link.href} onChange={(event) => onChange(links.map((item, itemIndex) => itemIndex === index ? { ...item, href: event.target.value } : item))} />
          <button type="button" onClick={() => onChange(links.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...links, { label: "", href: "" }])}>Add link</button>
    </fieldset>
  );
}

function move<T>(items: T[], index: number, direction: number) {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return items;
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ media: MediaItem[] }>("/api/admin/media").then((data) => setMedia(data.media)).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Could not load media.");
    });
  }, []);
  return (
    <main className="admin-main">
      <div className="admin-heading">
        <h1>Media</h1>
        <label className="button">Upload image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const alt = prompt("Alt text for this image") ?? "";
              uploadImage(file, alt).then((data) => setMedia((current) => [data.media, ...current])).catch((reason: unknown) => {
                setError(reason instanceof Error ? reason.message : "Upload failed.");
              });
            }}
          />
        </label>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <ul className="admin-media-grid">
        {media.map((item) => (
          <li key={item.id}>
            {item.kind === "image" ? <img src={`/media/${item.id}/thumb`} alt={item.alt} /> : <div className="admin-video-tile">MP4</div>}
            <p>{item.originalName || item.id}</p>
            <p>{Math.ceil(item.bytes / 1024)} KB</p>
            {item.kind === "image" ? (
              <input
                value={item.alt}
                placeholder="Alt text"
                onChange={(event) => setMedia((current) => current.map((entry) => entry.id === item.id ? { ...entry, alt: event.target.value } : entry))}
                onBlur={(event) => api(`/api/admin/media/${item.id}`, { method: "PATCH", body: JSON.stringify({ alt: event.target.value }) }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not save alt text."))}
              />
            ) : null}
            <button
              type="button"
              className="admin-quiet"
              onClick={() => api(`/api/admin/media/${item.id}`, { method: "DELETE" }).then(() => setMedia((current) => current.filter((entry) => entry.id !== item.id))).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not delete it."))}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

function HomepagePicks() {
  const [published, setPublished] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [selected, setSelected] = useState<string[]>(["", "", ""]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ selected: string[]; published: { id: string; title: string; slug: string }[] }>("/api/admin/homepage").then((data) => {
      setPublished(data.published);
      setSelected([data.selected[0] ?? "", data.selected[1] ?? "", data.selected[2] ?? ""]);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load homepage picks."));
  }, []);
  return (
    <main className="admin-main admin-narrow">
      <h1>Homepage</h1>
      <p className="admin-help">These three published articles appear in the proof list and the article grid. Leave them blank to use the three newest.</p>
      {selected.map((value, index) => (
        <label key={index}>Pick {index + 1}
          <select value={value} onChange={(event) => setSelected((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}>
            <option value="">Newest available</option>
            {published.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
          </select>
        </label>
      ))}
      {error ? <p className="admin-error">{error}</p> : null}
      {notice ? <p className="admin-notice">{notice}</p> : null}
      <button
        className="button"
        type="button"
        onClick={() => {
          api("/api/admin/homepage", { method: "PUT", body: JSON.stringify({ articleIds: selected.filter(Boolean) }) })
            .then(() => setNotice("Homepage updated"))
            .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not save."));
        }}
      >
        Save picks
      </button>
    </main>
  );
}
