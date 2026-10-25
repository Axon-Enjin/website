import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = new URL("../dist/", import.meta.url);
const pages = JSON.parse(
  readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
);
assert.equal(pages.name, "axon");
assert.equal(pages.pages_build_output_dir, "./dist");
assert.match(pages.compatibility_date, /^\d{4}-\d{2}-\d{2}$/);
const html = readFileSync(new URL("index.html", root), "utf8");
assert.match(html, /<main id="main">/);
assert.equal(
  (html.match(/<section /g) || []).length,
  8,
  "All eight sections must be pre-rendered",
);
assert.ok(
  html.includes("People,") &&
    html.includes("Stock by branch") &&
    html.includes("Prepare inquiry"),
);
assert.ok(
  !html.includes("<!--app-html-->"),
  "The static insertion point must be replaced",
);
assert.ok(
  !html.includes("cdn.tailwindcss.com"),
  "No runtime Tailwind dependency",
);
assert.match(html, /<script type="module"[^>]*src="\/assets\/[^\"]+\.js"/);
for (const path of [
  "assets/axon-mark.svg",
  "assets/hero-network.png",
  "assets/assembly-network.png",
  "articles/index.html",
  "preview/index.html",
  "docs/design-concepts/living-network/index.html",
]) {
  assert.ok(existsSync(new URL(path, root)), `Missing public route: ${path}`);
}
console.log(
  "PASS: pre-rendered page content, eight sections, compiled entry and preserved public routes.",
);
