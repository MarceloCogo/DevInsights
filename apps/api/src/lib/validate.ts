import type { ZodType } from "zod";

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details: Array<{ path: string; message: string }> };

export const parseBody = <T>(schema: ZodType<T>, body: unknown): ParseResult<T> => {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return formatZodError(result.error);
};

export const parseQuery = <T>(schema: ZodType<T>, query: unknown): ParseResult<T> => {
  const result = schema.safeParse(query);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return formatZodError(result.error);
};

const formatZodError = <T>(error: { issues: Array<{ path: PropertyKey[]; message: string }> }): ParseResult<T> => {
  const details = error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
  return {
    success: false,
    error: details.map((d) => `${d.path}: ${d.message}`).join("; "),
    details,
  };
};
