import type { ArticleRecord, Block, PublicStory } from "./types";
import { safeHref } from "./validate";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function indexOfSpecial(source: string, from: number) {
  const marks = ["**", "*", "["];
  let next = source.length;
  for (const mark of marks) {
    const at = source.indexOf(mark, from);
    if (at !== -1 && at < next) next = at;
  }
  return next === from ? from + 1 : next;
}

export function renderInline(source: string): string {
  const out: string[] = [];
  let index = 0;
  while (index < source.length) {
    if (source.startsWith("**", index)) {
      const end = source.indexOf("**", index + 2);
      if (end !== -1) {
        out.push(`<strong>${renderInline(source.slice(index + 2, end))}</strong>`);
        index = end + 2;
        continue;
      }
    }
    if (source[index] === "*" && source[index + 1] !== "*") {
      const end = source.indexOf("*", index + 1);
      if (end !== -1 && !source.slice(index + 1, end).includes("\n")) {
        out.push(`<em>${renderInline(source.slice(index + 1, end))}</em>`);
        index = end + 1;
        continue;
      }
    }
    if (source[index] === "[") {
      const labelEnd = source.indexOf("]", index + 1);
      if (labelEnd !== -1 && source[labelEnd + 1] === "(") {
        const hrefEnd = source.indexOf(")", labelEnd + 2);
        if (hrefEnd !== -1) {
          const href = source.slice(labelEnd + 2, hrefEnd).trim();
          if (safeHref(href)) {
            out.push(
              `<a href="${escapeHtml(href)}">${renderInline(source.slice(index + 1, labelEnd))}</a>`,
            );
            index = hrefEnd + 1;
            continue;
          }
        }
      }
    }
    const next = indexOfSpecial(source, index);
    out.push(escapeHtml(source.slice(index, next)));
    index = next;
  }
  return out.join("");
}

function figureClass(width: "content" | "wide") {
  return width === "wide" ? "article-figure is-wide" : "article-figure";
}

function caption(text: string) {
  const trimmed = text.trim();
  return trimmed ? `<figcaption>${renderInline(trimmed)}</figcaption>` : "";
}

function renderBlock(block: Block) {
  switch (block.type) {
    case "paragraph":
      return `<p>${renderInline(block.text)}</p>`;
    case "heading":
      return block.level === 3 ? `<h3>${renderInline(block.text)}</h3>` : `<h2>${renderInline(block.text)}</h2>`;
    case "list": {
      const tag = block.ordered ? "ol" : "ul";
      const items = block.items.map((item) => `<li>${renderInline(item)}</li>`).join("");
      return `<${tag}>${items}</${tag}>`;
    }
    case "quote":
      return `<blockquote><p>${renderInline(block.text)}</p></blockquote>`;
    case "divider":
      return "<hr>";
    case "image":
      return `<figure class="${figureClass(block.width)}"><img src="/media/${escapeHtml(block.mediaId)}" alt="${escapeHtml(block.alt)}" loading="lazy" decoding="async">${caption(block.caption)}</figure>`;
    case "video":
      return `<figure class="${figureClass(block.width)}"><video controls playsinline preload="metadata"${block.posterId ? ` poster="/media/${escapeHtml(block.posterId)}"` : ""}><source src="/media/${escapeHtml(block.mediaId)}" type="video/mp4"></video>${caption(block.caption)}</figure>`;
    case "embed": {
      const poster =
        block.provider === "youtube"
          ? ` style="background-image:url('https://i.ytimg.com/vi/${escapeHtml(block.videoId)}/hqdefault.jpg')"`
          : "";
      return `<figure class="${figureClass(block.width)}"><button type="button" class="embed-facade" data-provider="${block.provider}" data-video-id="${escapeHtml(block.videoId)}"${poster}><span>Play video</span></button>${caption(block.caption)}</figure>`;
    }
    default:
      return "";
  }
}

const EMBED_SCRIPT = `<script>
document.querySelectorAll(".embed-facade").forEach(function (button) {
  button.addEventListener("click", function () {
    var provider = button.getAttribute("data-provider");
    var id = button.getAttribute("data-video-id");
    var src = provider === "vimeo"
      ? "https://player.vimeo.com/video/" + id + "?autoplay=1"
      : "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1";
    var frame = document.createElement("iframe");
    frame.src = src;
    frame.title = "Video";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    button.replaceWith(frame);
  });
});
</script>`;

function shell(options: {
  title: string;
  description: string;
  canonical: string;
  image: string;
  body: string;
  preview?: boolean;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#04060d">
<title>${escapeHtml(options.title)}</title>
<meta name="description" content="${escapeHtml(options.description)}">
${options.preview ? '<meta name="robots" content="noindex">' : ""}
<link rel="canonical" href="${escapeHtml(options.canonical)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Axon Enjin">
<meta property="og:title" content="${escapeHtml(options.title)}">
<meta property="og:description" content="${escapeHtml(options.description)}">
<meta property="og:url" content="${escapeHtml(options.canonical)}">
<meta property="og:image" content="${escapeHtml(options.image)}">
<link rel="icon" href="/assets/axon-mark.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/dm-sans.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="/assets/fonts/instrument-serif-italic.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
<link rel="stylesheet" href="/assets/hero.css">
<link rel="stylesheet" href="/assets/company-presence.css">
<link rel="stylesheet" href="/assets/surfaces.css">
<link rel="stylesheet" href="/assets/articles.css">
</head>
<body class="article-page">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="header-container">
    <a class="brand" href="/" aria-label="Axon Enjin home">
      <img src="/assets/axon-mark.svg" width="39" height="26" alt="">
      <span>AXON ENJIN</span>
    </a>
    <nav class="article-nav" aria-label="Main navigation">
      <a href="/#purpose">About</a>
      <a href="/articles/" aria-current="page">Articles</a>
    </nav>
    <a class="button header-cta" href="/#contact">Collaborate <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a>
  </div>
</header>
<main id="main" class="article-main">
${options.body}
</main>
<footer class="site-footer">
  <div class="footer-inner wrap">
    <div class="footer-main">
      <a class="brand" href="/" aria-label="Axon Enjin home">
        <img src="/assets/axon-mark.svg" width="39" height="26" alt="">
        <span>AXON ENJIN</span>
      </a>
      <p>Metro Manila, Philippines</p>
      <nav aria-label="Footer navigation">
        <a href="/#company">Team</a>
        <a href="/articles/">Articles</a>
        <a href="/legal">Legal</a>
        <a href="https://delatorre.axonenjin.com/">Jerico</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Axon Enjin</span>
      <span>The one who connects.</span>
    </div>
  </div>
</footer>
${EMBED_SCRIPT}
</body>
</html>`;
}

function absolute(origin: string, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return new URL(path, origin).toString();
}

function heroImage(article: ArticleRecord) {
  if (article.hero?.kind === "image") return `/media/${article.hero.mediaId}`;
  if (article.hero?.kind === "video" && article.hero.posterId) return `/media/${article.hero.posterId}`;
  if (article.cardArt) return article.cardArt;
  return "/assets/og-axon-enjin-v1.jpg";
}

export function renderArticlePage(article: ArticleRecord, origin: string, preview = false) {
  const title = article.seoTitle.trim() || `${article.title} — Axon Enjin`;
  const description = article.seoDescription.trim() || article.dek || article.title;
  const path = `/articles/${article.slug}`;
  const hero = article.hero
    ? article.hero.kind === "image"
      ? `<figure class="article-figure is-wide"><img src="/media/${escapeHtml(article.hero.mediaId)}" alt="${escapeHtml(article.hero.alt)}" fetchpriority="high">${article.hero.caption.trim() ? `<figcaption>${renderInline(article.hero.caption)}</figcaption>` : ""}</figure>`
      : `<figure class="article-figure is-wide"><video controls playsinline preload="metadata" poster="/media/${escapeHtml(article.hero.posterId)}"><source src="/media/${escapeHtml(article.hero.mediaId)}" type="video/mp4"></video>${article.hero.caption.trim() ? `<figcaption>${renderInline(article.hero.caption)}</figcaption>` : ""}</figure>`
    : "";
  const links = [
    ...article.links.map(
      (link) => `<a class="text-link" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
    ),
    `<a class="text-link" href="/articles/">All articles</a>`,
  ].join("\n    ");
  const banner = preview ? `<p class="article-preview-banner">Draft preview. Readers cannot see this yet.</p>` : "";
  const body = `  <article class="article-detail">
    ${banner}
    <p class="article-type">${escapeHtml(article.type)}</p>
    <h1>${escapeHtml(article.title)}</h1>
    <p class="article-meta">${escapeHtml(article.byline)}</p>
    ${hero}
    <div class="article-body">
      ${article.body.map(renderBlock).join("\n      ")}
    </div>
    <div class="article-links">
    ${links}
    </div>
  </article>`;
  return shell({
    title,
    description,
    canonical: absolute(origin, path),
    image: absolute(origin, heroImage(article)),
    body,
    preview,
  });
}

export function renderArticleIndex(articles: ArticleRecord[]) {
  const rows = articles
    .map(
      (article) => `      <li class="article-row">
        <p class="article-type">${escapeHtml(article.type)}</p>
        <h2><a href="/articles/${escapeHtml(article.slug)}">${escapeHtml(article.listTitle || article.title)}</a></h2>
        <p>${escapeHtml(article.dek)}</p>
      </li>`,
    )
    .join("\n");
  const body = `  <section class="article-index" aria-labelledby="articles-title">
    <p class="article-type">Articles</p>
    <h1 id="articles-title">The work,<br><em>written down</em></h1>
    <p class="article-lede">Build. Think. Operate. Case. A case here is a public build we can name — not a paying-client story until that client says yes.</p>
    <p class="article-lede">Hackathons show speed under a clock. They do not show years of running a system. We say that on purpose.</p>
    <ul class="article-list">
${rows}
    </ul>
  </section>`;
  return shell({
    title: "Articles — Axon Enjin",
    description: "What we built, what we hit, what we learned. Constraint to artifact. Not a trophy wall.",
    canonical: "https://axonenjin.com/articles/",
    image: "https://axonenjin.com/assets/og-axon-enjin-v1.jpg",
    body,
  });
}

const DEFAULT_ART = [
  "/assets/hero-network.png",
  "/assets/manifesto-network.png",
  "/assets/assembly-network.png",
];

export function toPublicStory(article: ArticleRecord, index: number): PublicStory {
  return {
    title: article.listTitle || article.title,
    result: article.result,
    type: article.type,
    description: article.card || article.dek,
    href: `/articles/${article.slug}`,
    art: article.cardArt || DEFAULT_ART[index % DEFAULT_ART.length],
  };
}

export function renderSitemap(paths: string[]) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map(
      (path) => `  <url>
    <loc>https://axonenjin.com${path}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
