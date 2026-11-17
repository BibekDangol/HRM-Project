import { isAxiosError } from "axios";
import {
  appEndpoints, getAppErrorMessage,
  type AppEndpoint, type AppError, type AppErrorDetails, type ErrorContext, type ValidationFields,
} from "@/src/types/appError";

const kinds = new Set(["network", "timeout", "server", "notFound", "unauthorized", "validation", "unknown"]);
const fields = new Set(["email", "firstName", "lastName", "first_name", "last_name", "orgId", "supervisor_id", "oldPassword", "newPassword", "confirmPassword"]);
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" ? value as Record<string, unknown> : {};

export function createRequestId(): string {
  // Correlation only; this fallback is not a security token.
  return globalThis.crypto?.randomUUID?.() ?? "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const n = Math.floor(Math.random() * 16);
    return (c === "x" ? n : (n & 3) | 8).toString(16);
  });
}

function requestId(value: unknown): string | undefined {
  return typeof value === "string" && /^(?:[a-f\d]{32}|[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12})$/i.test(value) ? value : undefined;
}

export function getErrorEndpoint(url: unknown): AppEndpoint {
  const endpoint = typeof url === "string" ? url.replace(/^\//, "") : "";
  return appEndpoints.includes(endpoint as AppEndpoint) ? endpoint as AppEndpoint : "unknown";
}

function validationFields(value: unknown): ValidationFields {
  const result: ValidationFields = {};
  for (const [key, raw] of Object.entries(record(value))) {
    if (!fields.has(key)) continue;
    const code = typeof raw === "string" ? raw : record(raw).code;
    result[key as keyof ValidationFields] = code === "required" || code === "alreadyExists" ? code : "invalid";
  }
  return result;
}

export function mapAppError(error: unknown, fallback: Partial<ErrorContext> = {}): AppError {
  const raw = record(error);
  const response = record(raw.response);
  const config = record(raw.config);
  const localContext = record(config.appErrorContext);
  const existing = record(raw.context);
  const responseHeaders = record(response.headers);
  const requestHeaders = record(config.headers);
  const context: ErrorContext = {
    endpoint: getErrorEndpoint(existing.endpoint ?? fallback.endpoint ?? localContext.endpoint ?? config.url),
    requestId: requestId(responseHeaders["x-request-id"] ?? responseHeaders["X-Request-ID"]) ?? requestId(existing.requestId) ??
      requestId(localContext.requestId) ?? requestId(requestHeaders["X-Request-ID"] ?? requestHeaders["x-request-id"]) ?? requestId(fallback.requestId) ?? createRequestId(),
  };
  const status = typeof response.status === "number" ? response.status : raw.status;
  const data = record(response.data);
  const code = data.code ?? raw.code;
  let detail: AppErrorDetails;

  // Rebuild mapped errors instead of trusting their message, fields, cause, or extra properties.
  if (typeof raw.kind === "string" && kinds.has(raw.kind)) {
    if (raw.kind === "validation") detail = { kind: "validation", fields: validationFields(raw.fields) };
    else if (raw.kind === "server" && typeof raw.status === "number" && raw.status >= 500 && raw.status <= 599) detail = { kind: "server", status: raw.status };
    else if (["network", "timeout", "notFound", "unauthorized"].includes(raw.kind)) detail = { kind: raw.kind as "network" | "timeout" | "notFound" | "unauthorized" };
    else {
      const type = record(raw.cause).type;
      detail = { kind: "unknown", cause: { type: typeof type === "string" && ["exception", "undefined", "object", "string", "number", "boolean", "symbol", "bigint", "function"].includes(type) ? type : "unclassified" } };
    }
  } else if (code === "ECONNABORTED" || code === "ETIMEDOUT" || raw.name === "TimeoutError" || status === 408) {
    detail = { kind: "timeout" };
  } else if (status === 401 || ["bad_jwt", "session_not_found", "refresh_token_not_found", "refresh_token_already_used", "invalid_credentials"].includes(String(code))) {
    detail = { kind: "unauthorized" };
  } else if (status === 404 || code === "PGRST116") {
    detail = { kind: "notFound" };
  } else if (typeof status === "number" && status >= 500 && status <= 599) {
    detail = { kind: "server", status };
  } else if ([400, 409, 422].includes(Number(status)) || ["23505", "23502", "23514", "22P02", "validation_failed", "email_exists", "user_already_exists", "weak_password"].includes(String(code))) {
    const mappedFields = validationFields(data.fields ?? data.errors ?? raw.fields);
    if (code === "email_exists" || code === "user_already_exists") mappedFields.email = "alreadyExists";
    detail = { kind: "validation", fields: mappedFields };
  } else if (code !== "ERR_CANCELED" && (status === 0 || code === "ERR_NETWORK" || raw.name === "AuthRetryableFetchError" || (isAxiosError(error) && !error.response && Boolean(error.request)))) {
    detail = { kind: "network" };
  } else {
    detail = { kind: "unknown", cause: { type: error instanceof Error ? "exception" : typeof error } };
  }
  return { ...detail, context, message: getAppErrorMessage(detail) };
}

export function reportAppError(error: AppError): void {
  const safe = mapAppError(error);
  // Allowlist only: never send the exception, request body, headers, URL, or validation values.
  console.warn("Application request failed", {
    kind: safe.kind, endpoint: safe.context.endpoint, requestId: safe.context.requestId,
    ...(safe.kind === "server" ? { status: safe.status } : {}),
  });
}
