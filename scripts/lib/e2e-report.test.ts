import { describe, expect, it } from "vitest";
import { renderSummary, summarizeReport, type PlaywrightReport } from "./e2e-report";

const failing: PlaywrightReport = {
  suites: [
    {
      title: "catalog.spec.ts",
      specs: [
        {
          title: "grid shows the server failure @catalog-listing",
          ok: false,
          file: "e2e/catalog-listing.spec.ts",
          line: 12,
          tests: [
            {
              annotations: [{ type: "scenario", description: "error-500" }],
              results: [
                {
                  status: "failed",
                  error: {
                    message:
                      "Error: expect(locator).toHaveAttribute failed\nExpected: error:http\nReceived: loading\n  at e2e/catalog.spec.ts:14:3",
                  },
                  attachments: [{ path: "test-results/shot.png" }],
                },
              ],
            },
          ],
        },
        { title: "passes", ok: true },
      ],
    },
  ],
};

describe("e2e:summary", () => {
  it("prints only failures with scenario and artifacts", () => {
    const summary = summarizeReport(failing);
    const text = renderSummary(summary);
    expect(summary.failures).toBe(1);
    expect(summary.tests).toBe(2);
    expect(text).toContain("FAIL catalog.spec.ts > grid shows the server failure");
    expect(text).toContain("[scenario: error-500]");
    expect(text).toContain("e2e/catalog-listing.spec.ts:12");
    expect(text).toContain("Error: expect(locator).toHaveAttribute failed");
    expect(text).toContain("artifacts: test-results/shot.png");
    expect(text).not.toContain("Received: loading");
  });

  it("reports a clean run and respects the line budget", () => {
    expect(renderSummary(summarizeReport({}))).toContain("no failures");
    expect(summarizeReport(failing, 3).lines.length).toBeLessThanOrEqual(3);
  });
});
