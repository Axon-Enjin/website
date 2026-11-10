import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const validate = await vite.ssrLoadModule("/functions/_lib/validate.ts");
const render = await vite.ssrLoadModule("/functions/_lib/render.ts");
const schema = await vite.ssrLoadModule("/functions/_lib/schema.ts");
const seed = JSON.parse(readFileSync(new URL("../functions/_lib/seed-articles.json", import.meta.url), "utf8"));

assert.equal(schema.SCHEMA.trim(), readFileSync(new URL("../schema.sql", import.meta.url), "utf8").trim());
assert.equal(validate.containsCurrency("about $200 a month"), true);
assert.equal(validate.containsCurrency("PHP 50000"), true);
assert.equal(validate.containsCurrency("PHP/USD exchange rate"), false);
assert.equal(validate.containsCurrency("USDC liquidity"), false);
assert.equal(render.renderInline('<script>alert(1)</script>').includes("<script>"), false);
assert.match(render.renderInline("**IslaGrid**"), /<strong>IslaGrid<\/strong>/);
assert.match(render.renderInline("[Axial](https://axial.axonenjin.com)"), /href="https:\/\/axial\.axonenjin\.com"/);
assert.equal(validate.parseEmbedUrl("https://youtu.be/abcdefghijk")?.provider, "youtube");
assert.equal(validate.parseEmbedUrl("javascript:alert(1)"), null);

for (const article of seed) {
  const input = {
    ...article,
    hero: null,
    authorIds: ["user-0"],
    cardArt: article.cardArt,
  };
  const errors = validate.validateArticle(input, "publish");
  assert.deepEqual(errors, [], `${article.slug}: ${errors.join("; ")}`);
  const html = render.renderArticlePage(
    {
      ...input,
      id: "seed",
      status: "published",
      publishedAt: article.publishedAt,
      createdAt: article.publishedAt,
      updatedAt: article.publishedAt,
      createdBy: null,
      updatedBy: null,
    },
    "http://127.0.0.1:8788",
  );
  assert.match(html, new RegExp(article.title));
  assert.doesNotMatch(html, /\$\d|₱|PHP\s*\d/i);
}
assert.match(render.renderArticleIndex([]), /The work/);
console.log("PASS: article validation, rendering, embeds, and schema.");
await vite.close();
