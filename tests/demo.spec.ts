import { test, expect } from "@playwright/test";

test("presentation navigation and coordinated investigation workflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Business & Risk Command Center" }),
  ).toBeVisible();
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: "docs/command-center-desktop.png",
    fullPage: true,
  });
  const initial = await page.locator(".kpi strong").first().innerText();
  await page.getByRole("button", { name: "7 Days", exact: true }).click();
  expect(await page.locator(".kpi strong").first().innerText()).not.toBe(
    initial,
  );
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.getByRole("button", { name: "Open M1", exact: true }).click();
  await expect(
    page.getByText("Today vs Yesterday", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".kpi strong").first()).toContainText("164.58M");
  await page.getByRole("button", { name: "Brands", exact: true }).click();
  await page.getByRole("button", { name: "High Risk", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Command Center", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await page
    .getByRole("button", { name: "Vendor & Game Risk", exact: true })
    .click();
  await page.locator(".table-link").filter({ hasText: "JILI" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Investigate Players", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "demo_player_4821", exact: true }),
  ).toBeVisible();
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: "docs/player-investigation-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Escalate", exact: true }).click();
  await expect(page.locator(".player-priority")).toContainText("Escalated");
  await page.getByRole("button", { name: "Clear Case", exact: true }).click();
  await expect(page.locator(".player-priority")).toContainText("Cleared");
  await page
    .getByRole("button", { name: "Mark Reviewed", exact: true })
    .click();
  await expect(page.locator(".player-priority")).toContainText("Reviewed");
  await page
    .getByRole("button", { name: "Generate Alert", exact: true })
    .click();
  await expect(page.locator(".telegram-preview")).toContainText(
    "demo_player_4821",
  );
  await page
    .getByRole("button", { name: "Mark Reviewed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Withdrawal Monitor", exact: true })
    .click();
  await page.getByRole("button", { name: "High Risk", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page.getByRole("button", { name: "New Account", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page
    .getByRole("button", { name: "demo_player_2105", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "demo_player_2105", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Risk Center/ }).click();
  await page.getByRole("button", { name: "Low", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page
    .getByRole("button", { name: "AI Intelligence", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Which vendors are outside normal behavior?",
      exact: true,
    })
    .click();
  await expect(page.locator(".ai-answer")).toContainText("307K");
  await page
    .getByRole("textbox", { name: "Ask demo analyst" })
    .fill("Summarize withdrawals");
  await page.getByRole("button", { name: "Submit question" }).click();
  await expect(page.locator(".ai-answer")).toContainText("450,000");
  await page
    .getByRole("button", { name: "System Monitor", exact: true })
    .click();
  await expect(page.locator(".system-card")).toHaveCount(10);
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("snapshot refreshed");
  expect(errors).toEqual([]);
});

test("mobile layout and navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Business & Risk Command Center" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: "docs/command-center-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("button", { name: "AI Intelligence", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your operations, interpreted." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
