import type { FastifyInstance, FastifyRequest } from "fastify";
import { allowMcpProfileIssue, findMcpProfileByToken, McpProfileRejected, upsertMcpProfile, type McpProfileSource } from "@yuanjian/backend/mcp-profile";
import { config } from "@yuanjian/backend/config";
import { sendProblem } from "../http/respond.ts";

const PROFILE_COOKIE = "yuaneye_mcp_profile";

interface ProfileBody {
  token?: unknown;
  themes?: unknown;
  survey?: unknown;
  label?: unknown;
  rotate?: unknown;
}

function cookieToken(req: FastifyRequest): string | null {
  const cookie = req.headers.cookie ?? "";
  for (const item of cookie.split(";")) {
    const [name, ...value] = item.trim().split("=");
    if (name === PROFILE_COOKIE) return value.join("=") || null;
  }
  return null;
}

function bearerToken(req: FastifyRequest): string | null {
  const value = req.headers.authorization;
  return typeof value === "string" ? /^Bearer\s+(.+)$/i.exec(value)?.[1]?.trim() ?? null : null;
}

function setProfileCookie(req: FastifyRequest, reply: import("fastify").FastifyReply, token: string) {
  const secure = config.siteUrl.startsWith("https://") ? "; Secure" : "";
  reply.header("Set-Cookie", `${PROFILE_COOKIE}=${token}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`);
}

function responseProfile(profile: NonNullable<Awaited<ReturnType<typeof findMcpProfileByToken>>>) {
  return {
    profileId: profile.id,
    label: profile.label,
    themes: profile.themes,
    categories: profile.categories,
    survey: profile.survey,
    source: profile.source,
  };
}

function limited(req: FastifyRequest): boolean {
  return !allowMcpProfileIssue(String(req.ip || req.headers["x-real-ip"] || "unknown"), String(req.headers["user-agent"] ?? ""));
}

export function registerMcpProfile(app: FastifyInstance) {
  app.get("/api/site/mcp-profile", async (req, reply) => {
    reply.header("Cache-Control", "no-store");
    const token = bearerToken(req) ?? cookieToken(req);
    if (!token) return sendProblem(req, reply, { status: 404, code: "not_found", detail: "当前浏览器尚未绑定元见主题画像。" });
    try {
      const profile = await findMcpProfileByToken(token);
      if (!profile) return sendProblem(req, reply, { status: 404, code: "not_found", detail: "没有找到对应的主题画像。" });
      setProfileCookie(req, reply, token);
      return reply.send(responseProfile(profile));
    } catch (error) {
      req.log.error({ err: error }, "mcp profile lookup failed");
      return sendProblem(req, reply, { status: 503, code: "temporarily_unavailable", detail: "主题画像暂时无法读取，请稍后再试。", retryAfter: 30 });
    }
  });

  app.post("/api/site/mcp-profile", { bodyLimit: 32 * 1024 }, async (req, reply) => {
    reply.header("Cache-Control", "no-store");
    const body = (req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {}) as ProfileBody;
    const token = bearerToken(req) ?? cookieToken(req) ?? body.token;
    if (!token && limited(req)) return sendProblem(req, reply, { status: 429, code: "rate_limited", detail: "一小时内主题初始化次数已达上限，请稍后再试。", retryAfter: 3600 });
    try {
      const source: McpProfileSource = "web";
      const result = await upsertMcpProfile({ ...body, token, source });
      setProfileCookie(req, reply, result.token);
      return reply.code(result.issued ? 201 : 200).send({
        ...responseProfile(result.profile),
        issued: result.issued,
        ...(result.issued ? { token: result.token } : {}),
      });
    } catch (error) {
      if (error instanceof McpProfileRejected) return sendProblem(req, reply, { status: error.status, code: error.code, detail: error.message, retryAfter: error.retryAfter });
      req.log.error({ err: error }, "mcp profile api failed");
      return sendProblem(req, reply, { status: 503, code: "temporarily_unavailable", detail: "主题初始化暂时不可用，请稍后再试。", retryAfter: 30 });
    }
  });
}
