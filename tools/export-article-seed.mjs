import { readFileSync, writeFileSync } from "node:fs";

const meta = {
  "started.html": {
    listTitle: "Why we started",
    dek: "Why we stopped leaving hackathon projects behind and founded Axon Enjin.",
    card: "From hackathon weekends to a studio that keeps shipping.",
    result: "February 2026",
    cardArt: "/assets/hero-network.png",
    publishedAt: "2026-02-01T00:00:00.000Z",
  },
  "axial.html": {
    listTitle: "Axial",
    dek: "Seventy-two hours to Stellar Mainnet for Philippine MSME working capital.",
    card: "Seventy-two hours to Mainnet for MSME working capital.",
    result: "2nd runner-up · Stellar",
    cardArt: "/assets/manifesto-network.png",
    publishedAt: "2026-05-23T00:00:00.000Z",
  },
  "kpmg.html": {
    listTitle: "KPMG Academic Innovation Challenge",
    dek: "Archon and Mate for university support tickets and academic planning.",
    card: "Archon and Mate under institutional constraints.",
    result: "1st place",
    cardArt: "/assets/assembly-network.png",
    publishedAt: "2026-06-30T00:00:00.000Z",
  },
  "full-cup.html": {
    listTitle: "Full Cup Café",
    dek: "A pro-bono campus site, and the PUPreneurship Philanthropic Institution Award.",
    card: "A pro-bono campus site, and the PUPreneurship Philanthropic Institution Award.",
    result: "July 2026",
    cardArt: "/assets/hero-network.png",
    publishedAt: "2026-07-29T00:00:00.000Z",
  },
  "ph100.html": {
    listTitle: "StellarPH PH100",
    dek: "From PUP Sta. Mesa to the 100 brightest minds under 30.",
    card: "From PUP Sta. Mesa to the 100 brightest minds under 30.",
    result: "November 2026",
    cardArt: "/assets/manifesto-network.png",
    publishedAt: "2026-11-07T00:00:00.000Z",
  },
};

function decode(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function inlineFromHtml(html) {
  let value = html.trim();
  value = value.replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    return `[${inlineFromHtml(text)}](${decode(href)})`;
  });
  value = value.replace(/<strong>([\s\S]*?)<\/strong>/gi, (_, text) => `**${inlineFromHtml(text)}**`);
  value = value.replace(/<em>([\s\S]*?)<\/em>/gi, (_, text) => `*${inlineFromHtml(text)}*`);
  value = value.replace(/<[^>]+>/g, "");
  return decode(value).replace(/\s+/g, " ").trim();
}

function blocksFrom(html) {
  const blocks = [];
  const pattern = /<(p|h2|h3|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  let count = 1;
  while ((match = pattern.exec(html))) {
    const tag = match[1].toLowerCase();
    const inner = match[2];
    const id = `seed-${count}`;
    count += 1;
    if (tag === "p") blocks.push({ id, type: "paragraph", text: inlineFromHtml(inner) });
    else if (tag === "h2" || tag === "h3") {
      blocks.push({ id, type: "heading", level: tag === "h2" ? 2 : 3, text: inlineFromHtml(inner) });
    } else {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => inlineFromHtml(item[1]));
      blocks.push({ id, type: "list", ordered: tag === "ol", items });
    }
  }
  return blocks;
}

const articles = Object.entries(meta).map(([slug, extra]) => {
  const html = readFileSync(new URL(`../articles/${slug}`, import.meta.url), "utf8");
  const title = inlineFromHtml(html.match(/<h1>([\s\S]*?)<\/h1>/)[1]);
  const type = inlineFromHtml(html.match(/<p class="article-type">([\s\S]*?)<\/p>/)[1]);
  const byline = inlineFromHtml(html.match(/<p class="article-meta">([\s\S]*?)<\/p>/)[1]);
  const seoTitle = decode(html.match(/<title>([\s\S]*?)<\/title>/)[1].trim());
  const seoDescription = decode(html.match(/<meta name="description" content="([\s\S]*?)">/)[1]);
  const bodyHtml = html.split('<div class="article-body">')[1].split("</div>")[0];
  const linksHtml = html.split('<div class="article-links">')[1].split("</div>")[0];
  const links = [...linksHtml.matchAll(/<a class="text-link" href="([^"]+)">([\s\S]*?)<\/a>/g)]
    .map((match) => ({ href: decode(match[1]), label: inlineFromHtml(match[2]) }))
    .filter((link) => link.href !== "/articles/");
  return {
    slug,
    title,
    type,
    byline,
    seoTitle,
    seoDescription,
    body: blocksFrom(bodyHtml),
    links,
    ...extra,
  };
});

writeFileSync(new URL("../functions/_lib/seed-articles.json", import.meta.url), JSON.stringify(articles, null, 2));
console.log(`seeded ${articles.length} articles, ${articles.reduce((sum, article) => sum + article.body.length, 0)} blocks`);
