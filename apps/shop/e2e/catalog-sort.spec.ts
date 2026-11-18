import { expect, test, type Page } from "@playwright/test";
import { expectAxeClean, expectState, gotoWithScenario, primaryRegion } from "./_harness";

const region = (page: Page) => primaryRegion(page, "catalog-listing");
const firstResult = (page: Page) => region(page).locator("ul li h2").first();

test.describe("catalog sort @catalog-sort", () => {
  test("price and newest sorting change the order and the URL @catalog-sort", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");
    await expect(firstResult(page)).toHaveText("Alder Lounge Chair");

    await page.getByLabel("Sort by").selectOption("price-asc");
    await expect(page).toHaveURL(/[?&]sort=price-asc/);
    await expectState(region(page), "ready");
    await expect(firstResult(page)).toHaveText("Linen Table Runner");

    await page.getByLabel("Sort by").selectOption("price-desc");
    await expect(page).toHaveURL(/[?&]sort=price-desc/);
    await expectState(region(page), "ready");
    await expect(firstResult(page)).toHaveText("Sculptural Floor Lamp");

    await page.getByLabel("Sort by").selectOption("newest");
    await expect(page).toHaveURL(/[?&]sort=newest/);
    await expectState(region(page), "ready");
    await expect(firstResult(page)).toHaveText("Ceramic Planter Set");
  });

  test("a sort survives a reload @catalog-sort", async ({ page }) => {
    await gotoWithScenario(page, "/products?sort=rating", "ok");
    await expectState(region(page), "ready");
    await expect(page.getByLabel("Sort by")).toHaveValue("rating");
    await expect(firstResult(page)).toHaveText("Hand-Thrown Vase");

    await page.reload();
    await expectState(region(page), "ready");
    await expect(page.getByLabel("Sort by")).toHaveValue("rating");
    await expect(firstResult(page)).toHaveText("Hand-Thrown Vase");
  });

  test("sort combines with a category filter @catalog-sort", async ({ page }) => {
    await gotoWithScenario(page, "/products?category=Decor&sort=price-asc", "ok");
    await expectState(region(page), "ready");
    await expect(page.getByLabel("Sort by")).toHaveValue("price-asc");

    await expect(firstResult(page)).toHaveText("Brass Candle Holder");
    await expect(page.getByRole("heading", { name: "Hand-Thrown Vase" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Alder Lounge Chair" })).toHaveCount(0);
  });

  test("an unknown sort falls back to relevance @catalog-sort", async ({ page }) => {
    await gotoWithScenario(page, "/products?sort=cheapest", "ok");
    await expectState(region(page), "ready");
    await expect(page.getByLabel("Sort by")).toHaveValue("relevance");
    await expect(firstResult(page)).toHaveText("Alder Lounge Chair");
  });

  test("the sort control is keyboard reachable @catalog-sort", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    // A native select changes with the arrow keys without any custom key handling.
    await page.getByLabel("Sort by").focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByLabel("Sort by")).toHaveValue("price-asc");
    await expect(page).toHaveURL(/[?&]sort=price-asc/);
  });

  test("the sorted listing is axe clean @catalog-sort", async ({ page }) => {
    await gotoWithScenario(page, "/products?sort=price-desc", "ok");
    await expectState(region(page), "ready");
    await expectAxeClean(page);
  });
});
