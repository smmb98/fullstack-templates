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
  test("typing filters live without a full page reload @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");
    await expect(page.getByRole("heading", { name: "Alder Lounge Chair" })).toBeVisible();
    await page.evaluate(() => {
      (window as Window & { __catalogMarker?: string }).__catalogMarker = "alive";
    });

    await page.getByLabel("Search the collection").fill("candle");

    await expect(page).toHaveURL(/[?&]q=candle/, { timeout: 5_000 });
    await expectState(region(page), "ready");
    await expect(page.getByRole("heading", { name: "Brass Candle Holder" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Alder Lounge Chair" })).toHaveCount(0);
    await expect(
      page.evaluate(() => (window as Window & { __catalogMarker?: string }).__catalogMarker),
    ).resolves.toBe("alive");
  });

  test("a large collection waits for the Search button @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products", "large");
    await expectState(region(page), "ready");
    const searchButton = page.getByRole("button", { name: "Search" });
    await expect(searchButton).toBeVisible();

    await page.getByLabel("Search the collection").fill("candle");
    await page.waitForTimeout(700);
    await expect(page).not.toHaveURL(/[?&]q=candle/);

    await searchButton.click();
    await expect(page).toHaveURL(/[?&]q=candle/);
    await expectState(region(page), "ready");
    await expect(page.getByRole("heading", { name: "Brass Candle Holder" }).first()).toBeVisible();
  });

  test("category filters the grid and resets @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    const trigger = page.getByRole("button", { name: /^Filters/ });
    if (await trigger.isVisible()) await trigger.click();
    const panel = page.locator('[data-testid="filters-panel"]:visible').first();
    await panel.getByRole("button", { name: /^Decor/ }).click();
    const showResults = page.getByRole("button", { name: "Show results" });
    if (await showResults.isVisible()) await showResults.click();

    await expect(page).toHaveURL(/[?&]category=Decor/);
    await expectState(region(page), "ready");
    await expect(page.getByRole("heading", { name: "Hand-Thrown Vase" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Alder Lounge Chair" })).toHaveCount(0);

    await page
      .getByRole("group", { name: "Applied filters" })
      .getByRole("button", { name: /^Decor/ })
      .click();
    await expect(page).not.toHaveURL(/[?&]category=/);
    await expect(page.getByRole("heading", { name: "Alder Lounge Chair" })).toBeVisible();
  });

  test("the vase has a real photo, not just an image element @catalog-listing", async ({
    page,
  }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");
    const photo = page.getByAltText("Hand-thrown terracotta vase with a raw clay finish");
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toBeVisible();
    // A visible element with a broken src still passes toBeVisible, so check the decode.
    await expect
      .poll(() =>
        photo.evaluate(
          (img: HTMLImageElement) => img.src.endsWith("/hand-thrown-vase.svg") && img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
  });

  test("a broken photo falls back to a labelled placeholder @catalog-listing", async ({ page }) => {
    await page.route("**/hand-thrown-vase.svg", (route) => route.abort());
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");
    await page.getByRole("heading", { name: "Hand-Thrown Vase" }).scrollIntoViewIfNeeded();
    await expect(page.getByText("Image coming soon")).toBeVisible();
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

  test("pagination is URL-synced and survives a reload @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products", "large");
    await expectState(region(page), "ready");
    await expect(page.getByRole("heading", { name: /No\. 1$/ })).toBeVisible();

    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/[?&]page=2/);
    await expectState(region(page), "ready");
    await expect(page.getByRole("navigation", { name: "Pagination" })).toContainText("Page 2 of");
    await expect(page.getByRole("heading", { name: /No\. 13$/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("link", { name: "Previous" })).toBeVisible();

    await page.reload();
    await expectState(region(page), "ready");
    await expect(page.getByRole("heading", { name: /No\. 13$/ })).toBeVisible();
  });

  test("changing a filter resets the page to the first @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products?page=2", "large");
    await expectState(region(page), "ready");
    await expect(page).toHaveURL(/[?&]page=2/);

    await page.getByLabel("Search the collection").fill("candle");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(/[?&]q=candle/);
    await expect(page).not.toHaveURL(/[?&]page=/);
    await expect(page.getByRole("navigation", { name: "Pagination" })).toContainText("Page 1 of");
  });

  test("the layout toggle switches to list view and persists @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");
    const results = page.getByTestId("region-catalog-listing").locator("[data-view]");
    await expect(results).toHaveAttribute("data-view", "grid");

    const listButton = page.getByRole("button", { name: "List" });
    await listButton.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/[?&]view=list/);
    await expect(results).toHaveAttribute("data-view", "list");
    await expect(listButton).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expectState(region(page), "ready");
    await expect(page.getByTestId("region-catalog-listing").locator("[data-view]")).toHaveAttribute(
      "data-view",
      "list",
    );
  });

  test("empty and error states are axe clean @catalog-listing", async ({ page }) => {
    await gotoWithScenario(page, "/products?q=zzz", "empty");
    await expectState(region(page), "empty:no-results");
    await expectAxeClean(page);

    await gotoWithScenario(page, "/products", "error-500");
    await expectState(region(page), "error:http");
    await expectAxeClean(page);
  });
});
