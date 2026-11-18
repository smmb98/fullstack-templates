import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectAxeClean, expectState, gotoWithScenario, primaryRegion } from "./_harness";

const region = (page: Page) => primaryRegion(page, "catalog-listing");

/** Open the mobile drawer when present, then return the visible filter panel. */
async function openFilters(page: Page): Promise<Locator> {
  const trigger = page.getByRole("button", { name: /^Filters/ });
  if (await trigger.isVisible()) await trigger.click();
  return page.locator('[data-testid="filters-panel"]:visible').first();
}

async function closeDrawer(page: Page): Promise<void> {
  const showResults = page.getByRole("button", { name: "Show results" });
  if (await showResults.isVisible()) await showResults.click();
}

/**
 * Previous results stay visible while a new request is in flight (keepPreviousData),
 * so counts are polled instead of read once.
 */
async function expectResults(page: Page, count: number): Promise<void> {
  await expect.poll(() => region(page).getByRole("listitem").count()).toBe(count);
}

test.describe("catalog filters @catalog-filters", () => {
  test("brand checkboxes combine and update the URL @catalog-filters", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    const panel = await openFilters(page);
    await panel.getByLabel("Clay & Co").check();
    await closeDrawer(page);

    await expect(page).toHaveURL(/[?&]brand=Clay/);
    await expectResults(page, 2);
    await expect(page.getByRole("heading", { name: "Stoneware Serving Bowl" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Alder Lounge Chair" })).toHaveCount(0);

    const reopened = await openFilters(page);
    await reopened.getByLabel("Northline").check();
    await closeDrawer(page);
    await expectResults(page, 5);
  });

  test("a price range limits the results and survives a reload @catalog-filters", async ({
    page,
  }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    const panel = await openFilters(page);
    await panel.getByLabel("Minimum price").fill("100");
    await panel.getByLabel("Maximum price").fill("200");
    await panel.getByRole("button", { name: "Apply price" }).click();
    await closeDrawer(page);

    await expect(page).toHaveURL(/[?&]minPrice=10000/);
    await expect(page).toHaveURL(/[?&]maxPrice=20000/);
    await expectResults(page, 2);
    await expect(page.getByRole("heading", { name: "Grain Pendant Lamp" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Washed Linen Duvet Cover" })).toBeVisible();

    await page.reload();
    await expectState(region(page), "ready");
    await expectResults(page, 2);
  });

  test("an inverted price range shows an error and does not query @catalog-filters", async ({
    page,
  }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    const panel = await openFilters(page);
    await panel.getByLabel("Minimum price").fill("300");
    await panel.getByLabel("Maximum price").fill("100");

    await expect(panel.getByRole("alert")).toHaveText(
      "Minimum price must be below the maximum.",
    );
    await expect(panel.getByRole("button", { name: "Apply price" })).toBeDisabled();
    await expect(page).not.toHaveURL(/[?&]minPrice=/);
  });

  test("rating, stock and sale filters stack @catalog-filters", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    const panel = await openFilters(page);
    await panel.getByRole("button", { name: /^4\+/ }).click();
    await panel.getByLabel("In stock only").check();
    await panel.getByLabel("On sale").check();
    await closeDrawer(page);

    await expect(page).toHaveURL(/[?&]minRating=4/);
    await expect(page).toHaveURL(/[?&]inStock=true/);
    await expect(page).toHaveURL(/[?&]onSale=true/);
    await expectResults(page, 3);
    await expect(page.getByRole("heading", { name: "Grain Pendant Lamp" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Brass Candle Holder" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ceramic Planter Set" })).toBeVisible();
  });

  test("colour swatches and materials filter the grid @catalog-filters", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    const panel = await openFilters(page);
    await panel.getByRole("button", { name: /^Chalk \(/ }).click();
    await closeDrawer(page);

    await expect(page).toHaveURL(/[?&]color=Chalk/);
    await expectResults(page, 2);

    const reopened = await openFilters(page);
    await reopened.getByLabel("Ceramic").check();
    await closeDrawer(page);
    await expect(page).toHaveURL(/[?&]material=Ceramic/);
    await expectResults(page, 1);
    await expect(page.getByRole("heading", { name: "Ceramic Planter Set" })).toBeVisible();
  });

  test("applied chips remove one filter at a time and clear all @catalog-filters", async ({
    page,
  }) => {
    await gotoWithScenario(page, "/products?brand=Northline&inStock=true", "ok");
    await expectState(region(page), "ready");
    const chips = page.getByRole("group", { name: "Applied filters" });
    await expect(chips).toContainText("2 applied");

    await chips.getByRole("button", { name: /^Northline/ }).click();
    await expect(page).not.toHaveURL(/[?&]brand=/);
    await expectResults(page, 9);

    await chips.getByRole("button", { name: "Clear all" }).click();
    await expect(page).not.toHaveURL(/inStock=true/);
    await expectResults(page, 12);
  });

  test("facet labels show counts @catalog-filters", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");
    const panel = await openFilters(page);
    await expect(panel.getByRole("button", { name: "Decor (2)" })).toBeVisible();
    await expect(panel.getByLabel("Clay & Co (2)")).toBeVisible();
  });

  test("filters with no matches show the no-results state @catalog-filters", async ({ page }) => {
    await gotoWithScenario(page, "/products?category=Decor&brand=Northline", "ok");
    await expectState(region(page), "empty:no-results");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expectState(region(page), "ready");
    await expectResults(page, 12);
  });

  test("the mobile drawer traps focus, closes with Escape and returns focus @catalog-filters", async ({
    page,
  }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");
    const trigger = page.getByRole("button", { name: /^Filters/ });
    if (!(await trigger.isVisible())) test.skip();

    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("In stock only")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a filter can be applied with the keyboard @catalog-filters", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    const panel = await openFilters(page);
    await panel.getByLabel("Northline").focus();
    await page.keyboard.press("Space");
    await closeDrawer(page);

    await expect(page).toHaveURL(/[?&]brand=Northline/);
    await expectResults(page, 3);
  });

  test("the listing and the open drawer are axe clean @catalog-filters", async ({ page }) => {
    await gotoWithScenario(page, "/products?brand=Northline", "ok");
    await expectState(region(page), "ready");
    await expectAxeClean(page);

    const trigger = page.getByRole("button", { name: /^Filters/ });
    if (!(await trigger.isVisible())) return;
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await expectAxeClean(page);
  });
});
