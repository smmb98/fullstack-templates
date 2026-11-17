/** Compact, agent-friendly summary of a Playwright JSON report. */

export interface PlaywrightResult {
  status?: string;
  error?: { message?: string };
  attachments?: Array<{ name?: string; path?: string; contentType?: string }>;
}

export interface PlaywrightTest {
  status?: string;
  annotations?: Array<{ type?: string; description?: string }>;
  results?: PlaywrightResult[];
}

export interface PlaywrightSpec {
  title?: string;
  ok?: boolean;
  file?: string;
  line?: number;
  tests?: PlaywrightTest[];
}

export interface PlaywrightSuite {
  title?: string;
  file?: string;
  line?: number;
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

export interface PlaywrightReport {
  suites?: PlaywrightSuite[];
  errors?: Array<{ message?: string }>;
}

export interface SummaryResult {
  lines: string[];
  failures: number;
  tests: number;
}

function firstErrorLine(result: PlaywrightResult | undefined): string {
  const message = result?.error?.message ?? "";
  const line = message
    .split("\n")
    .map((part) => part.trim())
    .find((part) => part.length > 0 && !part.startsWith("at "));
  return line ?? "no error message";
}

function scenarioOf(test: PlaywrightTest | undefined): string | undefined {
  return test?.annotations?.find((annotation) => annotation.type === "scenario")?.description;
}

function failureOf(spec: PlaywrightSpec): PlaywrightResult | undefined {
  for (const test of spec.tests ?? []) {
    for (const result of test.results ?? []) {
      if (result.status && result.status !== "passed" && result.status !== "skipped") return result;
    }
  }
  return undefined;
}

function walk(
  suite: PlaywrightSuite,
  ancestors: string[],
  visit: (titles: string[], spec: PlaywrightSpec) => void,
): number {
  const titles = suite.title ? [...ancestors, suite.title] : ancestors;
  let tests = 0;
  for (const spec of suite.specs ?? []) {
    tests += 1;
    visit(titles, spec);
  }
  for (const child of suite.suites ?? []) tests += walk(child, titles, visit);
  return tests;
}

export function summarizeReport(report: PlaywrightReport, maxLines = 40): SummaryResult {
  const failures: Array<{ titles: string[]; spec: PlaywrightSpec }> = [];
  let tests = 0;

  for (const suite of report.suites ?? []) {
    tests += walk(suite, [], (titles, spec) => {
      if (spec.ok === false) failures.push({ titles, spec });
    });
  }

  const blocks = failures.map(({ titles, spec }) => {
    const test = spec.tests?.[0];
    const result = failureOf(spec);
    const name = [...titles, spec.title ?? "(untitled)"].filter(Boolean).join(" > ");
    const location = [spec.file, spec.line].filter(Boolean).join(":");
    const scenario = scenarioOf(test);
    const artifacts = (result?.attachments ?? [])
      .map((attachment) => attachment.path)
      .filter((path): path is string => Boolean(path));

    const block = [
      `FAIL ${name}${scenario ? ` [scenario: ${scenario}]` : ""}`,
      `  at ${location || "unknown"}`,
      `  ${firstErrorLine(result).slice(0, 160)}`,
    ];
    if (artifacts.length > 0) block.push(`  artifacts: ${artifacts.slice(0, 3).join(", ")}`);
    return block;
  });

  const reportErrors = (report.errors ?? [])
    .map((error) => (error.message ?? "").split("\n")[0]?.trim())
    .filter((message): message is string => Boolean(message));

  const reserve = reportErrors.length > 0 ? reportErrors.length + 1 : 0;
  const budget = Math.max(0, maxLines - reserve);
  const lines: string[] = [];
  let included = 0;
  for (const block of blocks) {
    if (lines.length + block.length > budget) break;
    lines.push(...block);
    included += 1;
  }
  if (included < blocks.length) {
    lines.push(`... ${blocks.length - included} more failure(s); see the JSON report`);
  }
  if (reportErrors.length > 0) {
    lines.unshift("Harness errors:");
    lines.push(...reportErrors);
  }

  return { lines: lines.slice(0, maxLines), failures: failures.length, tests };
}

export function renderSummary(result: SummaryResult): string {
  if (result.failures === 0 && result.lines.length === 0) {
    return `e2e:summary: no failures (${result.tests} test(s))`;
  }
  return result.lines.join("\n");
}
