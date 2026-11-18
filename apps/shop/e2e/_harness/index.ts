import AxeBuilder from "@axe-core/playwright";
import { expect, type BrowserContext, type Locator, type Page } from "@playwright/test";

/** Navigate with a scenario, which the app middleware stores in the demo cookie. */
export async function gotoWithScenario(page: Page, path = "/", scenario?: string): Promise<void> {
  const url = new URL(path, "http://placeholder");
  if (scenario) url.searchParams.set("scenario", scenario);
  await page.goto(`${url.pathname}${url.search}`);
}

export async function resetScenario(page: Page): Promise<void> {
  await gotoWithScenario(page, "/", "reset");
}

export async function expectState(locator: Locator, state: string): Promise<void> {
  await expect(locator).toHaveAttribute("data-state", state);
}

export async function goOffline(context: BrowserContext): Promise<void> {
  await context.setOffline(true);
}

export async function goOnline(context: BrowserContext): Promise<void> {
  await context.setOffline(false);
}

/** Simulates the Demo Controls "offline" toggle, which makes the api client throw. */
export async function simulateOffline(page: Page): Promise<void> {
  await page.evaluate(() => window.localStorage.setItem("fullstack-templates-simulate-offline", "1"));
}

export async function stopSimulatingOffline(page: Page): Promise<void> {
  await page.evaluate(() => window.localStorage.removeItem("fullstack-templates-simulate-offline"));
}

export async function expectAxeClean(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);
}

export const primaryRegion = (page: Page, feature: string) =>
  page.getByTestId(`region-${feature}`);
