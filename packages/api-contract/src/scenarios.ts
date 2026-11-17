export const scenarioNames = [
  "ok",
  "empty",
  "slow",
  "error-500",
  "error-401",
  "error-403",
  "error-404",
  "error-422",
  "rate-limit",
  "flaky",
  "partial",
  "large",
  "bad-json",
] as const;

export type ScenarioName = (typeof scenarioNames)[number];

export function isScenarioName(value: string): value is ScenarioName {
  return (scenarioNames as readonly string[]).includes(value);
}
