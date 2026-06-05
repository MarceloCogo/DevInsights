import type { FastifyReply } from "fastify";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export const ERRORS = {
  UNAUTHORIZED: { code: "UNAUTHORIZED", message: "Authentication required" },
  MISSING_ORGANIZATION: { code: "MISSING_ORGANIZATION", message: "No active organization found" },
  DATABASE_NOT_CONFIGURED: { code: "DATABASE_NOT_CONFIGURED", message: "Database is not configured" },
  VALIDATION_ERROR: { code: "VALIDATION_ERROR", message: "Invalid request payload" },
  NOT_FOUND: { code: "NOT_FOUND", message: "Resource not found" },
  FORBIDDEN: { code: "FORBIDDEN", message: "Access denied" },
  INTERNAL_ERROR: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
} as const;

export const sendError = (
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): FastifyReply => {
  const payload: { error: ApiError } = { error: { code, message } };
  if (details !== undefined) payload.error.details = details;
  return reply.code(statusCode).send(payload);
};

export const sendValidationError = (
  reply: FastifyReply,
  details: unknown
): FastifyReply => {
  return sendError(reply, 400, ERRORS.VALIDATION_ERROR.code, ERRORS.VALIDATION_ERROR.message, details);
};
