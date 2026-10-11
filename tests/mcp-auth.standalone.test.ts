import "./setup.ts";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import { after, test } from "node:test";
import Fastify from "fastify";
import { MCP_ONBOARDING_TOOL_NAMES, MCP_TOOL_NAMES } from "@yuanjian/contracts/mcp";

process.env.MCP_TOKENS = "Alice:yxzc_aaa:vulnerability|threat-intel;Bob:yxzc_bbb:ai-products";
const { registerMcp } = await import("../apps/api/src/routes/mcp.ts");

const records: string[] = [];
const stream = new Writable({ write(chunk, _encoding, callback) { records.push(String(chunk)); callback(); } });
const app = Fastify({ logger: { level: "info", stream } });
registerMcp(app);
after(() => app.close());

const initialize = (id: number) => ({ jsonrpc: "2.0", id, method: "initialize", params: {
  protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "auth-check", version: "1.0.0" },
} });

function resultBody(body: string) {
  const data = body.split("\n").find((line) => line.startsWith("data: "))?.slice(6);
  return JSON.parse(data ?? body) as { result?: { instructions?: string; tools?: Array<{ name: string }> } };
}

async function post(payload: Record<string, unknown>, authorization?: string) {
  return await app.inject({ method: "POST", url: "/api/mcp", headers: {
    host: "localhost", "content-type": "application/json", accept: "application/json, text/event-stream",
    ...(authorization ? { authorization } : {}),
  }, payload: JSON.stringify(payload) });
}

test("MCP bootstraps topics without a token, then binds an authenticated caller profile", async () => {
  const noToken = await post(initialize(1));
  assert.equal(noToken.statusCode, 200, noToken.body);
  const bootstrap = resultBody(noToken.body);
  assert.match(bootstrap.result?.instructions ?? "", /主题初始化/);

  const onboardingTools = await post({ jsonrpc: "2.0", id: 15, method: "tools/list", params: {} });
  assert.equal(onboardingTools.statusCode, 200, onboardingTools.body);
  assert.deepEqual((resultBody(onboardingTools.body).result?.tools ?? []).map((tool) => tool.name).sort(), Object.values(MCP_ONBOARDING_TOOL_NAMES).sort());

  const wrongToken = await post(initialize(2), "Bearer wrong-token");
  assert.equal(wrongToken.statusCode, 401);
  assert.equal(wrongToken.headers["www-authenticate"], 'Bearer realm="mcp"');

  const alice = await post(initialize(3), "Bearer yxzc_aaa");
  assert.equal(alice.statusCode, 200, alice.body);
  const aliceBody = resultBody(alice.body);
  assert.match(aliceBody.result?.instructions ?? "", /vulnerability.*threat-intel/);

  const tools = await post({ jsonrpc: "2.0", id: 4, method: "tools/list", params: {} }, "Bearer yxzc_aaa");
  assert.equal(tools.statusCode, 200, tools.body);
  const names = (resultBody(tools.body).result?.tools ?? []).map((tool) => tool.name).sort();
  assert.deepEqual(names, Object.values(MCP_TOOL_NAMES).sort());

  const bob = await post(initialize(5), "Bearer yxzc_bbb");
  assert.equal(bob.statusCode, 200, bob.body);
  assert.match(resultBody(bob.body).result?.instructions ?? "", /ai-products/);

  await new Promise<void>((resolve) => setImmediate(resolve));
  const logText = records.join("");
  assert.match(logText, /"caller":"Alice"/);
  assert.match(logText, /"caller":"Bob"/);
  assert.doesNotMatch(logText, /yxzc_aaa|yxzc_bbb/);
});
