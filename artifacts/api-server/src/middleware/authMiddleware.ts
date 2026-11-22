import * as oidc from "openid-client";
import { type Request, type Response, type NextFunction } from "express";
import type { AuthUser } from "@workspace/api-zod";
import { verifyJwt } from "../lib/jwt";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  getSession,
  updateSession,
  type SessionData,
} from "../lib/auth";

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;

      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

async function refreshIfExpired(
  sid: string,
  session: SessionData,
): Promise<SessionData | null> {
  const now = Math.floor(Date.now() / 1000);
  if (!session.expires_at || now <= session.expires_at) return session;

  if (!session.refresh_token) return null;

  try {
    const config = await getOidcConfig();
    const tokens = await oidc.refreshTokenGrant(
      config,
      session.refresh_token,
    );
    session.access_token = tokens.access_token;
    session.refresh_token = tokens.refresh_token ?? session.refresh_token;
    session.expires_at = tokens.expiresIn()
      ? now + tokens.expiresIn()!
      : session.expires_at;
    await updateSession(sid, session);
    return session;
  } catch {
    return null;
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  // 1. Check for platform JWT in Authorization header or conon_jwt cookie
  const authHeader = req.headers["authorization"];
  let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;
  if (!token) {
    token = req.cookies?.["conon_jwt"] || req.cookies?.["jwt"];
  }

  if (token) {
    const payload = verifyJwt(token);
    if (payload) {
      req.user = {
        id: String(payload.sub),
        email: (payload as any).email || null,
        firstName:
          (payload as any).name ||
          (payload.role === "vendor"
            ? "CONON Vendor"
            : payload.role === "admin"
            ? "Admin"
            : "CONON User"),
        lastName: null,
        profileImageUrl: null,
      };
      (req as any).userRole = payload.role;
      (req as any).jwtPayload = payload;
      next();
      return;
    }
  }

  // 2. Check for OIDC session cookie (e.g. Replit or hosted OIDC)
  const sid = getSessionId(req);
  if (!sid) {
    next();
    return;
  }

  try {
    const session = await getSession(sid);
    if (!session?.user?.id) {
      await clearSession(res, sid);
      next();
      return;
    }

    const refreshed = await refreshIfExpired(sid, session);
    if (!refreshed) {
      await clearSession(res, sid);
      next();
      return;
    }

    req.user = refreshed.user;
  } catch (err) {
    // If DB is offline or OIDC is not configured, do not crash the request
  }

  next();
}
