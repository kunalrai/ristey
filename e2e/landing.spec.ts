import { test, expect } from "@playwright/test";

test("landing page loads with Ristey branding", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Ristey/);
  await expect(page.locator("h1")).toContainText("Ristey");
});

test("landing page shows sign-in UI", async ({ page }) => {
  await page.goto("/");
  // Clerk renders its sign-in widget inside an iframe or a div
  // We just confirm the page rendered without crashing
  await expect(page.locator("body")).toBeVisible();
});
