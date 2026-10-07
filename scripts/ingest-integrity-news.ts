// Pull the first-party Yongxin Zhicheng news list from the host network and hand it to
// AIHOT's existing ingest pipeline. The Docker collector cannot currently reach this site,
// so the host-side fetch keeps the source boundary explicit without adding a new backend path.
import { load } from "cheerio";

const sourceUrl = process.env.INTEGRITY_NEWS_URL ?? "https://www.integritytech.com.cn/html/about/News/";
const siteUrl = (process.env.SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
const sourceId = process.env.INTEGRITY_NEWS_SOURCE_ID ?? "web-integrity-news";
const sourceName = process.env.INTEGRITY_NEWS_SOURCE_NAME ?? "永信至诚官网 · 新闻报道";
const token = process.env.INGEST_TOKEN;
if (!token) throw new Error("INGEST_TOKEN is required");

const page = await fetch(sourceUrl, {
  headers: { accept: "text/html,application/xhtml+xml", "user-agent": "YXZC-SecurityBot/1.0" },
  signal: AbortSignal.timeout(30_000),
});
if (!page.ok) throw new Error(`official news fetch failed: HTTP ${page.status}`);

const $ = load(await page.text());
const items = $("article.post")
  .map((_index, node) => {
    const link = $(node).find("h1 a").first().attr("href");
    const title = $(node).find("h1 a").first().text().replace(/\s+/g, " ").trim();
    const dateText = $(node).find("span.masonry-post-meta").first().text().trim();
    const date = /\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}:\d{2})?/.exec(dateText)?.[0] ?? null;
    if (!link || !title) return null;
    return {
      title,
      url: new URL(link, sourceUrl).toString(),
      ...(date ? { publishedAt: date.replace(" ", "T") + (date.length === 10 ? "T00:00:00" : "") + "+08:00" } : {}),
    };
  })
  .get()
  .filter((item): item is { title: string; url: string; publishedAt?: string } => item !== null)
  .slice(0, 50);

if (!items.length) throw new Error("official news page returned no article.post items");

const pushed = await fetch(`${siteUrl}/api/ingest/items`, {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify({ sourceId, sourceName, items }),
  signal: AbortSignal.timeout(30_000),
});
const responseText = await pushed.text();
if (!pushed.ok) throw new Error(`ingest failed: HTTP ${pushed.status} ${responseText.slice(0, 300)}`);
console.log(JSON.stringify({ sourceId, fetched: items.length, response: JSON.parse(responseText) }));
