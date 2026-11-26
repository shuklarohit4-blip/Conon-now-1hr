import express, { type Express } from "express";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./middleware/session";
import { authMiddleware } from "./middleware/authMiddleware";
import { errorHandler } from "./middleware/errorHandler";
import { CONON_IMAGES_DIR, CONON_PUBLIC_DIR, UPLOADS_DIR } from "./lib/paths";
import { pingDatabase } from "@workspace/db";

const app: Express = express();

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const configuredFrontend = process.env.FRONTEND_URL?.trim();
const rawAllowedOrigins = [
  configuredFrontend,
  process.env.FRONTEND_URLS,
  process.env.ALLOWED_ORIGINS,
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .join(",");

const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = origin.replace(/\/+$/, "");
      const isAllowed =
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(normalized) ||
        (configuredFrontend && normalized === configuredFrontend.replace(/\/+$/, ""));
      // Always permit local development / local MacBook admin (port 5174, 5173, etc.)
      const isLocalhost =
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[\w-]+\.local)(:\d+)?$/.test(normalized);
      const isNetlify =
        /\.netlify\.app$/.test(new URL(origin).hostname);
      const isVercel =
        /\.vercel\.app$/.test(new URL(origin).hostname);
      const isCononDomain =
        /(^|\.)cononinfrabuilt\.com$/.test(new URL(origin).hostname);

      if (isAllowed || isLocalhost || isNetlify || isVercel || isCononDomain) {
        callback(null, origin);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

// Cloud / Render Health Check route
app.get(["/health", "/api/health"], async (_req, res) => {
  let isDbHealthy = false;
  try {
    isDbHealthy = await pingDatabase();
  } catch {
    isDbHealthy = false;
  }
  res.json({
    status: "ok",
    db: isDbHealthy ? "connected" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV || "development",
  });
});

// Serve static images directly from public directory
if (fs.existsSync(CONON_IMAGES_DIR)) {
  app.use("/images", express.static(CONON_IMAGES_DIR));
  app.use("/api/images", express.static(CONON_IMAGES_DIR));
} else if (fs.existsSync(CONON_PUBLIC_DIR)) {
  app.use("/images", express.static(CONON_PUBLIC_DIR));
}

// Serve uploaded admin product images permanently from uploads/
if (fs.existsSync(UPLOADS_DIR)) {
  app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));
  app.use("/api/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));
}

// Razorpay webhook requires raw body for HMAC signature verification
app.use(
  "/api/wallet/razorpay/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(authMiddleware);

app.use("/api", router);

app.use(errorHandler);

export default app;
