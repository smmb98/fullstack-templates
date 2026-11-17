export const apiErrorKinds = [
  "network",
  "timeout",
  "http",
  "validation",
  "unauthorized",
  "forbidden",
  "not-found",
  "rate-limited",
  "parse",
] as const;

export type ApiErrorKind = (typeof apiErrorKinds)[number];

export interface ApiErrorInit {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  retryAfter?: number;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly retryAfter?: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly requestId: string;

  constructor(init: ApiErrorInit) {
    super(init.message, { cause: init.cause });
    this.name = "ApiError";
    this.kind = init.kind;
    this.status = init.status;
    this.retryAfter = init.retryAfter;
    this.fieldErrors = init.fieldErrors;
    this.requestId = init.requestId ?? "local";
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 422) return "validation";
  if (status === 429) return "rate-limited";
  return "http";
}
