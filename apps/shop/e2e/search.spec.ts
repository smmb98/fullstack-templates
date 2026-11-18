import { expect, test, type Page } from "@playwright/test";
import { expectAxeClean, expectState, gotoWithScenario } from "./_harness";

const region = (page: Page) => page.getByTestId("region-catalog-listing");
const panel = (page: Page) => page.getByTestId("region-search");
const box = (page: Page) => page.getByRole("combobox", { name: "Search products" });

test.describe("search @search", () => {
  test("suggestions open on the keyboard and Enter visits the active one @search", async ({
    page,
  }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    await box(page).fill("oak");
    await expectState(panel(page), "ready");
    await expect(panel(page).getByRole("option")).toHaveCount(1);

    await box(page).press("ArrowUp");
    await expect(box(page)).toHaveAttribute("aria-activedescendant", "search-option-0");
    await expect(panel(page).getByRole("option").first()).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await box(page).press("Enter");
    await expect(page).toHaveURL(/[?&]q=Oak%20Dining%20Table/);
    await expect(page.getByRole("heading", { name: "Oak Dining Table" })).toBeVisible();
  });

  test("a search is remembered and can be cleared @search", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    await box(page).fill("linen");
    await box(page).press("Enter");
    await expect(page).toHaveURL(/[?&]q=linen/);

    await box(page).click();
    await expect(panel(page)).toContainText("Recent searches");
    await expect(panel(page).getByRole("option", { name: /linen/ })).toBeVisible();

    await panel(page).getByRole("button", { name: "Clear recent searches" }).click();
    await expect(box(page)).toHaveAttribute("aria-expanded", "false");
    await box(page).click();
    await expect(box(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("recent searches survive a reload @search", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    await box(page).fill("brass");
    await box(page).press("Enter");
    await expect(page).toHaveURL(/[?&]q=brass/);

    await page.reload();
    await expectState(region(page), "ready");
    await box(page).click();
    await expect(panel(page)).toContainText("Recent searches");
    await expect(panel(page).getByRole("option", { name: /brass/ })).toBeVisible();
  });

  test("Escape closes the popup and keeps focus in the input @search", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    await box(page).fill("oak");
    await expectState(panel(page), "ready");
    await box(page).press("Escape");

    await expect(panel(page)).toHaveCount(0);
    await expect(box(page)).toBeFocused();
    await expect(box(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("no matches says so and still allows a plain search @search", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    await box(page).fill("zzzz");
    await expectState(panel(page), "empty:no-results");
    await expect(panel(page)).toContainText("No matches for “zzzz”");

    await box(page).press("Enter");
    await expect(page).toHaveURL(/[?&]q=zzzz/);
    await expectState(region(page), "empty:no-results");
  });

  test("a failed suggestion request offers a retry @search", async ({ page }) => {
    await gotoWithScenario(page, "/", "error-500");

    await box(page).fill("oak");
    await expectState(panel(page), "error:http");
    await expect(panel(page).getByRole("button", { name: "Try again" })).toBeVisible();

    await panel(page).getByRole("button", { name: "Try again" }).click();
    await expectState(panel(page), "error:http");
  });

  test("the open popup is axe clean @search", async ({ page }) => {
    await gotoWithScenario(page, "/products", "ok");
    await expectState(region(page), "ready");

    await box(page).fill("clay");
    await expectState(panel(page), "ready");
    await expect(panel(page).getByRole("option")).toHaveCount(3);
    await expectAxeClean(page);
  });
});
