import { expect, test, type Page } from "@playwright/test";
import { expectAxeClean, expectState, gotoWithScenario } from "./_harness";

const region = (page: Page) => page.getByTestId("region-product-detail");
const buy = (page: Page) => page.getByTestId("buy-actions");
const sticky = (page: Page) => page.getByTestId("sticky-buy-bar");

async function cart(page: Page) {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem("fullstack-templates-cart") ?? "[]"));
}

test.describe("product detail @product-detail", () => {
  test("opens from a catalog card with breadcrumbs and price @product-detail", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(page.getByTestId("region-catalog-listing"), "ready");

    await page.getByRole("link", { name: "Oak Dining Table" }).click();

    await expect(page).toHaveURL(/\/products\/oak-dining-table$/);
    await expectState(region(page), "ready");
    await expect(page.getByRole("heading", { level: 1, name: "Oak Dining Table" })).toBeVisible();
    await expect(region(page)).toContainText("$1,590.00");

    const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumbs.getByRole("link", { name: "Furniture" })).toHaveAttribute(
      "href",
      "/products?category=Furniture",
    );
    await expect(breadcrumbs.getByText("Oak Dining Table")).toHaveAttribute("aria-current", "page");
  });

  test("switches gallery photos @product-detail", async ({ page }) => {
    await gotoWithScenario(page, "/products/brass-candle-holder", "ok");
    await expectState(region(page), "ready");

    const main = region(page).getByRole("img", { name: "Brushed brass candle holder" });
    await expect(main).toBeVisible();

    await region(page)
      .getByRole("button", { name: "Show photo 2: Detail of the brass candle holder" })
      .click();

    await expect(
      region(page).getByRole("img", { name: "Detail of the brass candle holder" }),
    ).toBeVisible();
    await expect(main).toHaveCount(0);
  });

  test("adds a chosen variant and quantity to the bag @product-detail", async ({ page }) => {
    await gotoWithScenario(page, "/products/stoneware-serving-bowl", "ok");
    await expectState(region(page), "ready");

    await region(page).getByRole("radio", { name: "Large" }).check();
    await buy(page).getByLabel("Quantity").fill("2");
    await buy(page).getByRole("button", { name: /^Add to bag/ }).click();

    await expect(buy(page).getByRole("status")).toContainText(
      "Added 2 × Stoneware Serving Bowl (Speckled cream · Large) to your bag.",
    );
    await expect
      .poll(async () => cart(page))
      .toMatchObject([
        {
          slug: "stoneware-serving-bowl",
          variantId: "speckled-cream--large",
          quantity: 2,
          unitAmount: 5400,
        },
      ]);
  });

  test("an out-of-stock piece cannot be added @product-detail", async ({ page }) => {
    await gotoWithScenario(page, "/products/oak-dining-table", "ok");
    await expectState(region(page), "ready");

    await expect(region(page)).toContainText("Out of stock");
    await expect(buy(page).getByRole("button", { name: "Out of stock" })).toBeDisabled();
    await expect(buy(page).getByLabel("Quantity")).toBeDisabled();
    expect(await cart(page)).toEqual([]);
  });

  test("a missing product explains itself and points to the collection @product-detail", async ({
    page,
  }) => {
    await gotoWithScenario(page, "/products/not-a-real-piece", "empty");
    await expectState(region(page), "error:not-found");
    await expect(region(page)).toContainText("We could not find this piece.");

    await region(page).getByRole("button", { name: "Try again" }).click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test("the details accordion opens on the summary @product-detail", async ({ page }) => {
    await gotoWithScenario(page, "/products/stoneware-serving-bowl", "ok");
    await expectState(region(page), "ready");

    await expect(region(page).getByText("Wheel-thrown in small batches")).toBeVisible();
    const careSummary = region(page).locator("summary", { hasText: "Materials & care" });
    await expect(region(page).getByText("Dishwasher safe on a low heat cycle.")).toBeHidden();
    await careSummary.click();
    await expect(region(page).getByText("Dishwasher safe on a low heat cycle.")).toBeVisible();
  });

  test("the page carries Product structured data @product-detail", async ({ page }) => {
    await gotoWithScenario(page, "/products/stoneware-serving-bowl", "ok");
    await expectState(region(page), "ready");

    const raw = await page.getByTestId("product-json-ld").textContent();
    const data = JSON.parse(raw ?? "{}");
    expect(data).toMatchObject({
      "@type": "Product",
      name: "Stoneware Serving Bowl",
      offers: { price: "54.00", priceCurrency: "USD" },
    });
    expect(data.offers.availability).toBe("https://schema.org/InStock");
  });

  test("the page is axe clean @product-detail", async ({ page }) => {
    await gotoWithScenario(page, "/products/stoneware-serving-bowl", "ok");
    await expectState(region(page), "ready");
    await expectAxeClean(page);
  });

  test("the sticky bar adds the current selection on mobile @product-detail", async ({ page }) => {
    await gotoWithScenario(page, "/products/stoneware-serving-bowl", "ok");
    await expectState(region(page), "ready");
    if (!(await sticky(page).isVisible())) test.skip();

    await region(page).getByRole("radio", { name: "Large" }).check();
    await sticky(page).getByRole("button", { name: "Add to bag" }).click();

    await expect(buy(page).getByRole("status")).toContainText("(Speckled cream · Large)");
    await expect.poll(async () => cart(page)).toMatchObject([{ variantId: "speckled-cream--large", quantity: 1 }]);
  });
});
