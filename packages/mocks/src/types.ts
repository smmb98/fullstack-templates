import type { ScenarioName } from "@fullstack-templates/api-contract";

export interface MockContext {
  scenario: ScenarioName;
  latencyMs: number;
  query: Record<string, unknown>;
  body: unknown;
  headers: Record<string, string>;
}

export interface MockResult {
  status: number;
  body?: unknown;
  rawBody?: string;
  headers?: Record<string, string>;
  delayMs?: number;
}

export type MockHandler = (ctx: MockContext) => MockResult;

export const DEFAULT_LATENCY_MS = 3000;
export const RATE_LIMIT_SECONDS = 2;
