import {
  ApiError,
  kindFromStatus,
  type AnyEndpoint,
  type EndpointInput,
  type EndpointResponse,
} from "@fullstack-templates/api-contract";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

interface ErrorEnvelope {
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  return typeof value === "object" && value !== null;
}

function simulateOffline(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("fullstack-templates-simulate-offline") === "1";
}

function makeRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().slice(0, 8);
  return Math.random().toString(16).slice(2, 10);
}

function buildUrl(endpoint: AnyEndpoint, query?: Record<string, unknown>): string {
  const path = `${API_BASE_URL}${endpoint.path}`;
  const url = new URL(path, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return typeof window === "undefined" ? `${url.pathname}${url.search}` : url.toString();
}

function isRetryable(kind: ApiError["kind"], status?: number): boolean {
  return kind === "network" || (status !== undefined && status >= 500);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestOnce<E extends AnyEndpoint>(
  endpoint: E,
  input: EndpointInput<E> | undefined,
  attempt: number,
): Promise<EndpointResponse<E>> {
  if (simulateOffline()) {
    throw new ApiError({ kind: "network", message: "You are offline." });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const requestId = makeRequestId();

  try {
    const response = await fetch(buildUrl(endpoint, input?.query as Record<string, unknown>), {
      method: endpoint.method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-request-id": requestId,
        "x-attempt": String(attempt),
      },
      body: input?.body === undefined ? undefined : JSON.stringify(input.body),
      credentials: "same-origin",
      signal: controller.signal,
    });

    if (!response.ok) {
      let envelope: ErrorEnvelope = {};
      try {
        const parsed: unknown = await response.json();
        if (isErrorEnvelope(parsed)) envelope = parsed;
      } catch {
        // The status still carries the failure; keep the envelope empty.
      }
      const retryAfterHeader = response.headers.get("retry-after");
      const retryAfter = retryAfterHeader ? Number(retryAfterHeader) || undefined : undefined;
      throw new ApiError({
        kind: kindFromStatus(response.status),
        status: response.status,
        message: envelope.message ?? `Request failed with ${response.status}.`,
        fieldErrors: envelope.fieldErrors,
        retryAfter,
        requestId: response.headers.get("x-request-id") ?? requestId,
      });
    }

    const contentType = response.headers.get("content-type") ?? "";
    let payload: unknown;
    try {
      payload = contentType.includes("application/json") ? await response.json() : await response.text();
    } catch (cause) {
      throw new ApiError({ kind: "parse", message: "The response was not valid JSON.", cause, requestId });
    }

    const parsed = endpoint.response.safeParse(payload);
    if (!parsed.success) {
      throw new ApiError({
        kind: "parse",
        message: "The response did not match the contract.",
        cause: parsed.error,
        requestId,
      });
    }
    return parsed.data as EndpointResponse<E>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError({ kind: "timeout", message: "The request timed out.", cause: error, requestId });
    }
    throw new ApiError({
      kind: "network",
      message: "Could not reach the server.",
      cause: error,
      requestId,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function apiRequest<E extends AnyEndpoint>(
  endpoint: E,
  input?: EndpointInput<E>,
): Promise<EndpointResponse<E>> {
  let attempt = 0;
  for (;;) {
    try {
      return await requestOnce(endpoint, input, attempt);
    } catch (error) {
      if (
        error instanceof ApiError &&
        endpoint.method === "GET" &&
        attempt < MAX_RETRIES &&
        isRetryable(error.kind, error.status)
      ) {
        attempt += 1;
        await sleep(250 * 2 ** (attempt - 1));
        continue;
      }
      throw error;
    }
  }
}
