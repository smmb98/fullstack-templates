import { expect, test, type Page } from "@playwright/test";
import {
  expectAxeClean,
  expectState,
  gotoWithScenario,
  primaryRegion,
  simulateOffline,
  stopSimulatingOffline,
} from "./_harness";

const region = (page: Page) => primaryRegion(page, "catalog-listing");

interface MatrixEntry {
  scenario: string;
  state: string;
  path?: string;
}

const matrix: readonly MatrixEntry[] = [
  { scenario: "ok", state: "ready" },
  { scenario: "large", state: "ready" },
  { scenario: "flaky", state: "ready" },
  { scenario: "partial", state: "partial" },
  { scenario: "empty", state: "empty:no-results", path: "/products?q=nothing-matches" },
  { scenario: "error-500", state: "error:http" },
  { scenario: "error-401", state: "error:unauthorized" },
  { scenario: "error-403", state: "error:forbidden" },
  { scenario: "error-404", state: "error:not-found" },
  { scenario: "error-422", state: "error:http" },
  { scenario: "rate-limit", state: "error:rate-limited" },
  { scenario: "bad-json", state: "error:parse" },
];

test.describe("catalog listing state matrix @catalog-listing", () => {
  for (const entry of matrix) {
    test(`${entry.scenario} shows ${entry.state} @catalog-listing`, async ({ page }) => {
      await gotoWithScenario(page, entry.path ?? "/products", entry.scenario);
      await expectState(region(page), entry.state);
    });
  }

  test("empty without filters shows the first-use state @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products", "empty");
    await expectState(region(page), "empty:first-use");
  });

  test("no matches offers a clear-filters action @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products?q=zzz", "empty");
    await expectState(region(page), "empty:no-results");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expectState(region(page), "empty:first-use");
  });
});

test.describe("catalog listing behaviour @catalog-listing", () => {
  test("search updates the URL and narrows the grid @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");
    await expect(page.getByRole("heading", { name: "Alder Lounge Chair" })).toBeVisible();

    await page.getByLabel("Search the collection").fill("candle");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(/[?&]q=candle/);
    await expectState(region(page), "ready");
    await expect(page.getByRole("heading", { name: "Brass Candle Holder" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Alder Lounge Chair" })).toHaveCount(0);
  });

  test("offline shows the network error and recovers on retry @catalog-listing", async ({
    page,
  }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    await simulateOffline(page);
    await page.reload();
    await expectState(region(page), "error:network");

    await stopSimulatingOffline(page);
    await page.getByRole("button", { name: "Try again" }).click();
    await expectState(region(page), "ready");
  });

  test("the ready collection is axe clean @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");
    await expectAxeClean(page);
  });
});
