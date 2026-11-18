import type { AnyEndpoint } from "@fullstack-templates/api-contract";
import { parseScenarioValue, resolveScenario, scenarioFromCookie } from "./scenario";
import type { MockHandler, MockResult } from "./types";

export interface MockRequest {
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

function queryObject(url: URL): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) query[key] = value;
  return query;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validationErrors(endpoint: AnyEndpoint, query: Record<string, string>) {
  if (!endpoint.query) return null;
  const parsed = endpoint.query.safeParse(query);
  if (parsed.success) return null;
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".") || "form";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}

export async function executeMock(
  endpoint: AnyEndpoint,
  handler: MockHandler,
  request: MockRequest,
): Promise<MockResult> {
  const url = new URL(request.url);
  const query = queryObject(url);
  const headers = Object.fromEntries(
    Object.entries(request.headers).map(([key, value]) => [key.toLowerCase(), value]),
  );

  const scenarioParam = url.searchParams.get("scenario") ?? scenarioFromCookie(headers.cookie ?? null);
  const selection = parseScenarioValue(scenarioParam);
  const scenario = resolveScenario(selection, endpoint.id, endpoint.scenarios);

  if (scenario === "unsupported") {
    return {
      status: 400,
      body: {
        error: "unsupported-scenario",
        message: `This endpoint does not support "${selection.invalid ?? scenarioParam}".`,
        supported: endpoint.scenarios,
      },
    };
  }

  const fieldErrors = validationErrors(endpoint, query);
  if (fieldErrors) {
    return {
      status: 422,
      body: { error: "validation", message: "Check the highlighted fields.", fieldErrors },
    };
  }

  const parsedQuery: Record<string, unknown> = endpoint.query
    ? (endpoint.query.parse(query) as Record<string, unknown>)
    : query;

  const latency = url.searchParams.get("latency");
  const latencyMs = latency ? Number(latency) : 0;

  const result = handler({
    scenario,
    latencyMs: Number.isFinite(latencyMs) && latencyMs > 0 ? latencyMs : 0,
    query: parsedQuery,
    body: request.body,
    headers,
  });

  if (result.delayMs && result.delayMs > 0) await sleep(result.delayMs);
  return result;
}
