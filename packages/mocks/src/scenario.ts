import { isScenarioName, type ScenarioName } from "@showcase/api-contract";

export interface ScenarioSelection {
  global?: ScenarioName;
  perEndpoint: Record<string, ScenarioName>;
  /** First token that is not a known scenario name, if any. */
  invalid?: string;
}

export function parseScenarioValue(value: string | null | undefined): ScenarioSelection {
  const selection: ScenarioSelection = { perEndpoint: {} };
  if (!value) return selection;

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const [left, right] = part.split(":").map((piece) => piece.trim());
    if (!right) {
      if (isScenarioName(left)) selection.global = left;
      else selection.invalid ??= left;
      continue;
    }
    if (isScenarioName(right)) selection.perEndpoint[left] = right;
    else selection.invalid ??= right;
  }
  return selection;
}

export function resolveScenario(
  selection: ScenarioSelection,
  endpointId: string,
  supported: readonly ScenarioName[],
): ScenarioName | "unsupported" {
  if (selection.invalid) return "unsupported";
  const requested = selection.perEndpoint[endpointId] ?? selection.global ?? "ok";
  if (!supported.includes(requested)) return "unsupported";
  return requested;
}

export function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  const cookies: Record<string, string> = {};
  for (const item of header.split(";")) {
    const index = item.indexOf("=");
    if (index === -1) continue;
    const key = item.slice(0, index).trim();
    const value = item.slice(index + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export function scenarioFromCookie(header: string | null): string | null {
  return parseCookies(header).demo_scenario ?? null;
}
