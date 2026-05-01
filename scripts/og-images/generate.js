import { chromium } from "playwright";
import TOML from "@iarna/toml";
import { readFile, readdir, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const NEWS_DIR = join(REPO_ROOT, "content", "news");
const OUT_DIR = join(REPO_ROOT, "static", "og");
const TEMPLATE = await readFile(join(__dirname, "template.html"), "utf-8");
const BRANDMARK_RAW = await readFile(
  join(REPO_ROOT, "static", "img", "archipelagio-brandmark.svg"),
  "utf-8",
);
// Strip XML declaration / DOCTYPE, scale to 56px via attributes
const BRANDMARK = BRANDMARK_RAW
  .replace(/<\?xml[^?]*\?>/i, "")
  .replace(/<!DOCTYPE[^>]*>/i, "")
  .replace(/<svg([^>]*)>/i, '<svg$1 class="brand-mark" width="56" height="56">')
  .trim();

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;");

const formatDate = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
};

function parseTomlFrontMatter(raw) {
  const m = raw.match(/^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n/);
  if (!m) return null;
  return TOML.parse(m[1]);
}

async function loadPosts() {
  const entries = await readdir(NEWS_DIR);
  const posts = [];
  for (const f of entries) {
    if (!f.endsWith(".md") || f === "_index.md") continue;
    const path = join(NEWS_DIR, f);
    const raw = await readFile(path, "utf-8");
    const data = parseTomlFrontMatter(raw);
    if (!data || data.draft) continue;
    posts.push({
      slug: basename(f, ".md"),
      title: data.title,
      description: data.description || "",
      date: data.date,
      category: data.extra?.category || "Article",
      author: data.extra?.author || "Raffael Schneider",
    });
  }
  return posts;
}

async function renderPost(page, post) {
  const html = TEMPLATE
    .replace("__BRANDMARK__", BRANDMARK)
    .replace("__TITLE__", escapeHtml(post.title))
    .replace("__DESCRIPTION__", escapeHtml(post.description))
    .replace("__CATEGORY__", escapeHtml(post.category))
    .replace("__DATE__", escapeHtml(formatDate(post.date)))
    .replace("__AUTHOR__", escapeHtml(post.author));

  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);

  const out = join(OUT_DIR, `${post.slug}.png`);
  await page.screenshot({
    path: out,
    clip: { x: 0, y: 0, width: 1200, height: 630 },
    omitBackground: false,
  });
  return out;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const posts = await loadPosts();
  if (posts.length === 0) {
    console.log("No published posts found.");
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  for (const post of posts) {
    const out = await renderPost(page, post);
    console.log(`✓ ${post.slug} → ${out}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
