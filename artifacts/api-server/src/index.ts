// Load .env file first (local dev). On Replit, env vars are injected by the
// platform and dotenv is a no-op when the variables are already present.
import "dotenv/config";

import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { initSocket } from "./socket";
import { closeDatabase, connectDatabase } from "@workspace/db";

// Fall back to 5001 locally (avoids macOS AirPlay conflict on 5000).
// On Replit the platform injects PORT — that value takes precedence.
const rawPort = process.env["PORT"];
const port = rawPort && !Number.isNaN(Number(rawPort)) ? Number(rawPort) : 5001;

const server = createServer(app);
initSocket(server);

process.on("SIGTERM", () => {
  server.close(() => {
    void closeDatabase().finally(() => process.exit(0));
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    void closeDatabase().finally(() => process.exit(0));
  });
});

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});

void connectDatabase()
  .then(() => {
    server.listen(port, () => {
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Could not connect to MongoDB");
    process.exit(1);
  });
