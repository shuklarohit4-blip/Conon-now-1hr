import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

const COOKIE_NAME = "_sid";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

export function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  let sessionId = req.cookies?.[COOKIE_NAME] as string | undefined;

  if (!sessionId || typeof sessionId !== "string" || sessionId.length < 10) {
    sessionId = randomUUID();
    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  req.sessionId = sessionId;
  next();
}
