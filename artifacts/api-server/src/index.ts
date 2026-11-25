// Load .env file first (local dev / environment configuration).
import "dotenv/config";

import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { initSocket } from "./socket";
import { closeDatabase, connectDatabase } from "@workspace/db";

// Fall back to 5001 in dev/local environments to match Vite proxy.
// Environment PORT takes precedence when defined (Render assigns this automatically).
const rawPort = process.env["PORT"];
const port = rawPort && !Number.isNaN(Number(rawPort)) ? Number(rawPort) : 5001;

const server = createServer(app);
initSocket(server);

let retryTimer: NodeJS.Timeout | undefined;
let connectionAttempts = 0;
const MAX_CONNECT_ATTEMPTS = 3;

function cleanup() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = undefined;
  }
  server.close(() => {
    void closeDatabase().finally(() => process.exit(0));
  });
}

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);

// Global process error safety guards to prevent unhandled rejection crashes
process.on("unhandledRejection", (reason: any) => {
  logger.warn({ reason: reason?.message || String(reason) }, "Unhandled promise rejection captured safely");
});

process.on("uncaughtException", (error: Error) => {
  logger.error({ error: error?.message || String(error), stack: error?.stack }, "Uncaught exception captured");
  if (error.message?.includes("EADDRINUSE")) {
    process.exit(1);
  }
});

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});

let isConnecting = false;
async function tryConnectDatabase(): Promise<boolean> {
  if (isConnecting) return false;
  isConnecting = true;
  connectionAttempts++;
  try {
    await connectDatabase();
    logger.info("Connected to MongoDB successfully and verified indexes.");
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = undefined;
    }
    isConnecting = false;
    return true;
  } catch (err) {
    isConnecting = false;
    const msg = (err as Error)?.message || "";

    if (connectionAttempts >= MAX_CONNECT_ATTEMPTS) {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = undefined;
      }
      logger.warn(
        { attempts: connectionAttempts, reason: msg.slice(0, 100) },
        "[MongoDB] Remote database connection capped after 3 attempts. Operating in graceful fallback mode (PostgreSQL / In-Memory Store) with zero crashes.",
      );
      void closeDatabase().catch(() => {});
      return false;
    }

    const backoffMs = connectionAttempts === 1 ? 2000 : 4000;
    logger.warn(
      { attempt: connectionAttempts, maxAttempts: MAX_CONNECT_ATTEMPTS, nextRetryInMs: backoffMs },
      `[MongoDB] Connection attempt ${connectionAttempts} failed. Retrying in ${backoffMs / 1000}s...`,
    );

    retryTimer = setTimeout(() => {
      void tryConnectDatabase();
    }, backoffMs);
    retryTimer.unref();

    return false;
  }
}

if (!process.env.NO_SERVER_LISTEN) {
  server.listen(port, "0.0.0.0", () => {
    logger.info({ port, host: "0.0.0.0" }, "Server listening on local network");
    // Initiate connection in background with capped exponential backoff
    void tryConnectDatabase();
  });
}

export { app, server };
