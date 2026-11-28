import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./middleware/session";
import { authMiddleware } from "./middleware/authMiddleware";
import { errorHandler } from "./middleware/errorHandler";
import { authRateLimiter, uploadRateLimiter } from "./middleware/rateLimiter";
import { CONON_IMAGES_DIR, CONON_PUBLIC_DIR, UPLOADS_DIR } from "./lib/paths";
import { pingDatabase } from "@workspace/db";
import { catalogSyncService } from "./services/catalogSyncService";
import { loadUploadedAssetFromDb, runLocalhostUrlCleanupMigration } from "./utils/uploadSanitizer";

void runLocalhostUrlCleanupMigration();

const app: Express = express();
app.set("trust proxy", 1);

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
        /^(exp|exps|https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[\w-]+\.local)(:\d+)?/.test(normalized);
      const hostname = (() => {
        try {
          return new URL(origin).hostname;
        } catch {
          return "";
        }
      })();
      const isNetlify = /\.netlify\.app$/.test(hostname);
      const isVercel = /\.vercel\.app$/.test(hostname);
      const isDevTunnel = /\.devtunnels\.ms$/.test(hostname);
      const isCononDomain = /(^|\.)cononinfrabuilt\.com$/.test(hostname);

      if (isAllowed || isLocalhost || isNetlify || isVercel || isDevTunnel || isCononDomain) {
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
  let dbHealth: { postgres: "connected" | "error"; mongo: "connected" | "error"; mode: "live" | "fallback" } = {
    postgres: "error",
    mongo: "error",
    mode: "fallback",
  };
  let isDbHealthy = false;
  try {
    const [health, mongoPing] = await Promise.all([
      catalogSyncService.getHybridDbHealth(),
      pingDatabase().catch(() => false),
    ]);
    dbHealth = health;
    isDbHealthy = mongoPing || health.postgres === "connected" || health.mongo === "connected";
  } catch {
    isDbHealthy = false;
  }
  res.json({
    status: "ok",
    postgres: dbHealth.postgres,
    mongo: dbHealth.mongo,
    mode: dbHealth.mode,
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

// Serve uploaded admin product, category & banner images permanently from disk or Postgres DB fallback
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const uploadStaticOptions = {
  maxAge: "1h",
  setHeaders: (res: express.Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
};
app.use("/uploads", express.static(UPLOADS_DIR, uploadStaticOptions));
app.use("/api/uploads", express.static(UPLOADS_DIR, uploadStaticOptions));

// Postgres BYTEA fallback if ephemeral cloud container restarted cleanly
app.get(["/uploads/*rest", "/api/uploads/*rest"], async (req, res, next) => {
  try {
    const cleanPath = req.path.replace(/^\/api(?=\/uploads\/)/, "");
    const asset = await loadUploadedAssetFromDb(cleanPath);
    if (!asset) {
      res.status(404).json({ ok: false, error: "Asset not found" });
      return;
    }
    // Warm local disk cache for subsequent fast static reads
    try {
      const rel = cleanPath.replace(/^\/uploads\//, "");
      const target = path.resolve(UPLOADS_DIR, rel);
      if (target.startsWith(path.resolve(UPLOADS_DIR))) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, asset.data);
      }
    } catch {
      // Non-fatal
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Content-Type", asset.contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(asset.data);
  } catch (err) {
    next(err);
  }
});

// Rate limit auth & image upload endpoints in production
app.use(["/api/auth/otp", "/api/auth/vendor-login", "/api/auth/customer-login", "/api/auth/partner-login"], authRateLimiter);
app.use(["/api/categories/upload-image", "/api/products/upload-image", "/api/admin/merchandising/upload"], uploadRateLimiter);

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
