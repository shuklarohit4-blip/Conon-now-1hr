// Load .env file first (local dev / environment configuration).
import "dotenv/config";

import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { initSocket } from "./socket";
import { closeDatabase, connectDatabase } from "@workspace/db";

// Fall back to 5000 in dev/local environments.
// Environment PORT takes precedence when defined (Render assigns this automatically).
const rawPort = process.env["PORT"];
const port = rawPort && !Number.isNaN(Number(rawPort)) ? Number(rawPort) : 5000;

const server = createServer(app);
initSocket(server);

let retryTimer: NodeJS.Timeout | undefined;

function cleanup() {
  if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = undefined;
  }
  server.close(() => {
    void closeDatabase().finally(() => process.exit(0));
  });
}

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});

let isConnecting = false;
async function tryConnectDatabase(): Promise<boolean> {
  if (isConnecting) return false;
  isConnecting = true;
  try {
    await connectDatabase();
    logger.info("Connected to MongoDB successfully and verified indexes.");
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = undefined;
    }
    isConnecting = false;
    return true;
  } catch (err) {
    isConnecting = false;
    const msg = (err as Error)?.message || "";
    if (msg.includes("alert number 80") || msg.includes("tlsv1 alert")) {
      logger.warn(
        { err: msg },
        "MongoDB Atlas dropped the SSL connection (SSL alert 80). Ensure your current IP is whitelisted under Atlas Network Access (0.0.0.0/0 for dev). Will retry in background...",
      );
    } else {
      logger.warn(
        { err: msg },
        "Could not connect to MongoDB. Will retry in background...",
      );
    }
    return false;
  }
}

if (!process.env.NO_SERVER_LISTEN) {
  server.listen(port, () => {
    logger.info({ port }, "Server listening");
    // Initiate connection in background so the HTTP server is immediately accessible
    void tryConnectDatabase().then((connected) => {
      if (!connected && !retryTimer) {
        retryTimer = setInterval(() => {
          void tryConnectDatabase();
        }, 10000);
        retryTimer.unref();
      }
    });
  });
}

export { app, server };
