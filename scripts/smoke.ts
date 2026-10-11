// Opens the site's main pages and machine exits and checks each answers: the whole-site check after a
// deploy, and CI's check of the built site on an empty database.
//   node scripts/smoke.ts [--base http://localhost:3000]  // local dev; Docker default is http://localhost:3100
import { SITE } from "@yuanjian/site";

const at = process.argv.indexOf("--base");
const base = (at > 0 ? process.argv[at + 1] : process.env.SITE_URL) ?? "http://localhost:3000";

const PAGES = ["/", "/all", "/hot", "/daily", "/daily/archive", "/topics", "/starred", "/agent", "/about", "/changelog", "/feedback", "/terms", "/privacy", "/more", "/admin/login"];
const MACHINE: Array<[path: string, type: RegExp]> = [
  ["/api/health", /json/],
  ["/api/v1/items", /json/],
  ["/api/v1/hot-topics", /json/],
  ["/api/v1/selected/snapshot", /json/],
  ["/feed.xml", /xml/],
  ["/feed/all.xml", /xml/],
  ["/llms.txt", /text\/plain/],
  ["/robots.txt", /text\/plain/],
  ["/sitemap.xml", /xml/],
  ["/manifest.webmanifest", /manifest/],
  ["/openapi-v1.json", /json/],
  ["/og/site.png", /image\/png/],
  ["/icon.png", /image\/png/],
  ["/favicon.ico", /icon/],
];

let failed = 0;
async function check(path: string, expect: (res: Response, body: string) => string | null) {
  try {
    const res = await fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
    const body = res.headers.get("content-type")?.startsWith("image/") ? "" : await res.text();
    const problem = res.status !== 200 ? `HTTP ${res.status}` : expect(res, body);
    console.log(`${problem ? "✗" : "✓"} ${path}${problem ? `  ${problem}` : ""}`);
    if (problem) failed += 1;
  } catch (error) {
    console.log(`✗ ${path}  ${String(error)}`);
    failed += 1;
  }
}

// Pages write the name as HTML text: a name such as "MyF&B" appears as "MyF&amp;B".
const htmlName = SITE.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
for (const path of PAGES) await check(path, (_res, body) => (body.includes(SITE.name) || body.includes(htmlName) ? null : `the page does not name ${SITE.name}`));
for (const [path, type] of MACHINE) await check(path, (res) => (type.test(res.headers.get("content-type") ?? "") ? null : `content-type ${res.headers.get("content-type")}`));
// MCP: a missing credential enters the topic-onboarding flow; an authenticated handshake answers with
// the site's server name. A fresh install may omit MCP_TOKEN, in which case onboarding is enough for
// this smoke check.
const mcpPayload = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "smoke", version: "1" } } });
const mcpUnauth = await fetch(`${base}/api/mcp`, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
  body: mcpPayload,
});
const mcpUnauthBody = await mcpUnauth.text();
const mcpUnauthOk = mcpUnauth.status === 200 && mcpUnauthBody.includes("主题初始化");
console.log(`${mcpUnauthOk ? "✓" : "✗"} /api/mcp no token -> onboarding${mcpUnauthOk ? "" : `  HTTP ${mcpUnauth.status}`}`);
if (!mcpUnauthOk) failed += 1;

const mcpToken = process.env.MCP_TOKEN;
if (!mcpToken) {
  console.log("· /api/mcp authenticated initialize  skipped (MCP_TOKEN not set; onboarding is available)");
} else {
  const mcp = await fetch(`${base}/api/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", authorization: `Bearer ${mcpToken}` },
    body: mcpPayload,
  }).then((r) => r.text()).catch((e) => String(e));
  const mcpOk = mcp.includes(`"name":"${SITE.mcpPrefix}"`);
  console.log(`${mcpOk ? "✓" : "✗"} /api/mcp authenticated initialize${mcpOk ? "" : `  ${mcp.slice(0, 200)}`}`);
  if (!mcpOk) failed += 1;
}

console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
