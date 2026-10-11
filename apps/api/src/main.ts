import { assertProductionSecrets, config } from "@yuanjian/backend/config";
import { closeDb } from "@yuanjian/backend/db";
import { installModules } from "@yuanjian/backend/modules";
import { SERVER_MODULES } from "@yuanjian/site/modules/server";
import { DEPLOYMENT } from "@yuanjian/site";
import { startHeartbeat } from "@yuanjian/backend/operations/heartbeat";
import { startWorkerWatchdog } from "@yuanjian/backend/operations/watch";
import { buildApp } from "./app.ts";

installModules(SERVER_MODULES);
assertProductionSecrets([
  ["auth", "SESSION_SECRET"],
  ["auth", "IMG_PROXY_SIGN_SECRET"],
  ["auth", "POSTGRES_PASSWORD"],
  ["auth", "ADMIN_PASSWORD"],
  ...DEPLOYMENT.requiredSecrets,
]);
// MCP can issue and persist profiles through the onboarding tools. MCP_TOKENS remains an optional
// compatibility path for pre-provisioned callers; database-backed profiles are checked at request time.

const app = await buildApp();
await app.listen({ port: config.apiPort, host: process.env.API_HOST || "127.0.0.1" });
startHeartbeat(`api:${config.apiPort}`);
startWorkerWatchdog();

let stopping = false;
const shutdown = async () => {
  if (stopping) return;
  stopping = true;
  await app.close();
  await closeDb();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
