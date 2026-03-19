import { test } from "@playwright/test";

test("capture errors after sign-in", async ({ page }) => {
  const errors: string[] = [];
  const consoleLogs: string[] = [];
  const networkFails: string[] = [];

  page.on("pageerror", (err) => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });

  page.on("console", (msg) => {
    if (["error", "warn"].includes(msg.type())) {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  page.on("requestfailed", (req) => {
    networkFails.push(`FAILED: ${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
  });

  page.on("response", (res) => {
    if (res.status() >= 400) {
      networkFails.push(`HTTP ${res.status()}: ${res.url()}`);
    }
  });

  await page.goto("/");
  await page.waitForSelector("text=Sign in", { timeout: 10000 });

  console.log(">>> Sign in now, then press Resume in the Playwright inspector <<<");
  await page.pause();

  // Capture 8 seconds of activity after sign-in
  await page.waitForTimeout(8000);

  console.log("\n=== PAGE ERRORS ===");
  if (errors.length === 0) console.log("none");
  errors.forEach((e) => console.log(e));

  console.log("\n=== CONSOLE ERRORS/WARNINGS ===");
  if (consoleLogs.length === 0) console.log("none");
  consoleLogs.forEach((l) => console.log(l));

  console.log("\n=== NETWORK FAILURES ===");
  if (networkFails.length === 0) console.log("none");
  networkFails.forEach((n) => console.log(n));

  console.log("\n=== FINAL URL ===", page.url());

  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("\n=== BODY ===", bodyText.slice(0, 300));
});
