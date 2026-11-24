import { expect, test } from "@playwright/test";

test("shows the seeded board", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Studio board" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Backlog" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Done" })).toBeVisible();
  await expect(page.getByTestId("card-launch-narrative")).toBeVisible();
  await expect(page.getByTestId("card-type-system")).toBeVisible();
});

test("keeps a rename after an earlier escape", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Backlog" }).click();
  await page.getByRole("textbox", { name: "Column name" }).press("Escape");
  await expect(page.getByRole("button", { name: "Backlog" })).toBeVisible();

  await page.getByRole("button", { name: "Backlog" }).click();
  const input = page.getByRole("textbox", { name: "Column name" });
  await input.fill("Ideas");
  await input.press("Tab");

  await expect(page.getByRole("button", { name: "Ideas" })).toBeVisible();
});

test("renames a column", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Backlog" }).click();
  const input = page.getByRole("textbox", { name: "Column name" });
  await input.fill("Ideas");
  await input.press("Enter");

  await expect(page.getByRole("button", { name: "Ideas" })).toBeVisible();
  await expect(page.getByRole("button", { name: "To Do" })).toBeVisible();
});

test("adds and deletes a card", async ({ page }) => {
  await page.goto("/");

  const column = page.getByTestId("column-backlog");
  await column.getByLabel("Card title").fill("Ship the checklist");
  await column.getByLabel("Card details").fill("Include owners and dates");
  await column.getByRole("button", { name: "Add card" }).click();

  await expect(column.getByText("Ship the checklist")).toBeVisible();
  await expect(column.getByText("Include owners and dates")).toBeVisible();

  await column.locator("[data-testid^='card-']", { hasText: "Ship the checklist" }).locator("button").click();
  await expect(column.getByText("Ship the checklist")).toHaveCount(0);
});

test("drags a card into another column", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");

  const card = page.getByTestId("card-launch-narrative").locator("article");
  const target = page.getByTestId("column-done");
  await target.scrollIntoViewIfNeeded();

  const cardBox = await card.boundingBox();
  const targetBox = await target.boundingBox();
  if (!cardBox || !targetBox) throw new Error("Missing drag targets");

  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 30 },
  );
  await page.mouse.up();

  await expect(target.getByTestId("card-launch-narrative")).toBeVisible();
  await expect(page.getByTestId("column-backlog").getByTestId("card-launch-narrative")).toHaveCount(0);
});
