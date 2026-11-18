import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

// Storybook runs beside the app in compose; the alias keeps Chrome on plain http.
const storybookUrl = process.env.PLAYWRIGHT_STORYBOOK_URL ?? "http://localhost:6006";

interface StoryIndex {
  entries?: Record<string, { id: string; type: string; title: string }>;
}

async function gotoStory(page: Page, id: string): Promise<string[]> {
  const errors: string[] = [];
  const onConsole = (message: ConsoleMessage) => {
    if (message.type() === "error") errors.push(message.text());
  };
  const onPageError = (error: Error) => errors.push(error.message);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  await page.goto(`${storybookUrl}/iframe.html?id=${id}&viewMode=story`);
  await expect(page.locator("#storybook-root")).not.toBeEmpty({ timeout: 15_000 });

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  return errors;
}

test.describe("storybook renders @storybook", () => {
  test("every feature story renders without console errors @storybook", async ({
    page,
    request,
  }) => {
    const indexResponse = await request.get(`${storybookUrl}/index.json`);
    expect(indexResponse.ok()).toBeTruthy();
    const index = (await indexResponse.json()) as StoryIndex;
    const stories = Object.values(index.entries ?? {}).filter(
      (entry) => entry.type === "story" && entry.title.startsWith("Features/"),
    );
    expect(stories.length).toBeGreaterThan(0);

    const failures: string[] = [];
    for (const story of stories) {
      const errors = await gotoStory(page, story.id);
      if (errors.length > 0) failures.push(`${story.id}: ${errors[0]}`);
    }

    expect(failures).toEqual([]);
  });

  test("the missing-image story shows the labelled placeholder @storybook", async ({ page }) => {
    const errors = await gotoStory(page, "features-catalog-listing--missing-image");
    await expect(page.getByText("Image coming soon")).toBeVisible();
    expect(errors).toEqual([]);
  });
});
