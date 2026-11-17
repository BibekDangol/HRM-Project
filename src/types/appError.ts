export const appEndpoints = [
  "unknown", "auth-session", "profile-email-check", "admin-add-user",
  "admin-edit-user", "admin-delete-user", "change-password", "generate-upload-url",
  "get-leave-type", "add-leave-type", "edit-leave-type", "delete-leave-type",
  "fetch-leave-services", "fetch-supervisor-leaves",
] as const;

export type AppEndpoint = typeof appEndpoints[number];
export type ErrorContext = { endpoint: AppEndpoint; requestId: string };
export type ValidationIssue = "required" | "invalid" | "alreadyExists";
export type ValidationFields = Partial<Record<
  "email" | "firstName" | "lastName" | "first_name" | "last_name" | "orgId" |
  "supervisor_id" | "oldPassword" | "newPassword" | "confirmPassword",
  ValidationIssue
>>;

export type AppErrorDetails =
  | { kind: "network" }
  | { kind: "timeout" }
  | { kind: "server"; status: number }
  | { kind: "notFound" }
  | { kind: "unauthorized" }
  | { kind: "validation"; fields: ValidationFields }
  // Only a sanitized description is retained, never the original exception.
  | { kind: "unknown"; cause: unknown };

export type AppError = AppErrorDetails & { context: ErrorContext; message: string };

export type AppResult<T> = { success: true; data: T } | { success: false; error: AppError };

export function getAppErrorMessage(error: Pick<AppError, "kind">): string {
  switch (error.kind) {
    case "network": return "You're offline. Check your connection and try again.";
    case "timeout": return "We couldn't confirm the result in time. Check whether the action completed before trying again.";
    case "server": return "We're having trouble right now. Please try again.";
    case "notFound": return "The requested information could not be found.";
    case "unauthorized": return "Your session has ended. Sign in again to continue.";
    case "validation": return "Check the details below and try again.";
    case "unknown": return "Something went wrong. Please try again.";
  }
}
