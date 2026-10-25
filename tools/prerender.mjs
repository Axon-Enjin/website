import { cp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { render } from "../.vite-ssr/render.js";

const root = new URL("../", import.meta.url);
const entry = new URL("dist/index.html", root);
const html = await readFile(entry, "utf8");
if (!html.includes("<!--app-html-->"))
  throw new Error("Missing prerender insertion point");
await writeFile(entry, html.replace("<!--app-html-->", render()));
// Preserve existing public URLs for artwork, references and article pages.
for (const path of [
  "assets",
  "articles",
  "preview",
  "docs/design-concepts",
  ".nojekyll",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
]) {
  const source = new URL(path, root);
  if (existsSync(source))
    await cp(source, new URL(`dist/${path}`, root), { recursive: true });
}
console.log("Prerendered homepage and copied static public routes.");
