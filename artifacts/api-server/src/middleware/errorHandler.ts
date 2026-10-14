import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

// Domain error thrown when a B2B order exceeds the contractor's available
// Khata credit. Maps to HTTP 402 Payment Required.
export class CreditExceededError extends Error {
  availableCredit: number;
  requiredAmount: number;

  constructor(availableCredit: number, requiredAmount: number) {
    super("Order exceeds the contractor's available credit limit");
    this.name = "CreditExceededError";
    this.availableCredit = availableCredit;
    this.requiredAmount = requiredAmount;
  }
}

function isDatabaseConnectionError(error: unknown): boolean {
  const visited = new Set<unknown>();
  const pending: unknown[] = [error];
  const connectionErrorCodes = new Set([
    "08000",
    "08001",
    "08003",
    "08004",
    "08006",
    "28P01",
    "28000",
    "3D000",
  ]);
  const connectionErrorMessages = [
    "no postgresql connection config found",
    "econnrefused",
    "enotfound",
    "etimedout",
    "password authentication failed",
    "client password must be a string",
    "sasl",
  ];

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    if (typeof current === "string") {
      const normalized = current.toLowerCase();
      if (connectionErrorMessages.some((message) => normalized.includes(message))) {
        return true;
      }
      continue;
    }

    if (typeof current !== "object") continue;

    const details = current as {
      cause?: unknown;
      code?: unknown;
      message?: unknown;
    };
    if (typeof details.code === "string" && connectionErrorCodes.has(details.code)) {
      return true;
    }
    if (typeof details.message === "string") {
      pending.push(details.message);
    }
    if (details.cause) {
      pending.push(details.cause);
    }
  }

  return false;
}

// Centralized error handler. Must be registered after all routes.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (res.headersSent) {
    return;
  }

  if (isDatabaseConnectionError(err)) {
    res.status(503).json({
      error: "Database unavailable",
      details:
        "Set DATABASE_URL or PGHOST/PGUSER/PGDATABASE (and optionally PGPASSWORD) to a working PostgreSQL instance.",
    });
    return;
  }

  if (err instanceof CreditExceededError) {
    res.status(402).json({
      error: err.message,
      availableCredit: err.availableCredit,
      requiredAmount: err.requiredAmount,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Invalid request",
      details: err.issues,
    });
    return;
  }

  logger.error({ err }, "Unhandled request error");
  res.status(500).json({ error: "Internal server error" });
}
