import { test, expect } from "@playwright/test";

test("check session state at /", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);

  const url = page.url();
  const bodyText = await page.locator("body").innerText();
  const hasSignIn = await page.locator("text=Sign in").count();
  const hasLoading = await page.locator("text=Loading").count();

  const localStorage = await page.evaluate(() => {
    const keys = Object.keys(window.localStorage);
    const clerkKeys = keys.filter(k => k.includes("clerk") || k.includes("__clerk"));
    return {
      allKeys: keys,
      clerkKeys,
      hasSession: clerkKeys.some(k => k.includes("session")),
    };
  });

  console.log("URL:            ", url);
  console.log("Sign-in visible:", hasSignIn > 0);
  console.log("Loading state:  ", hasLoading > 0);
  console.log("Clerk keys:     ", localStorage.clerkKeys);
  console.log("Has session:    ", localStorage.hasSession);
  console.log("Body preview:   ", bodyText.slice(0, 200));

  expect(url).toContain("localhost:5173");
});

test("check session state after manual sign-in", async ({ page }) => {
  await page.goto("/");

  // Wait for sign-in widget to appear
  await page.waitForSelector("text=Sign in", { timeout: 10000 });

  console.log("=== Sign in now in the browser window, then come back here and press Resume ===");

  // Pause so you can sign in manually in the headed browser
  await page.pause();

  // After you resume, wait for navigation away from /
  await page.waitForTimeout(3000);

  const url = page.url();
  const bodyText = await page.locator("body").innerText().catch(() => "");

  const session = await page.evaluate(() => {
    const keys = Object.keys(window.localStorage);
    const clerkKeys = keys.filter(k => k.includes("clerk") || k.includes("__clerk"));
    return {
      clerkKeys,
      hasSession: clerkKeys.length > 0,
    };
  });

  const cookies = await page.context().cookies();
  const clerkCookies = cookies.filter(c => c.name.includes("clerk") || c.name.startsWith("__session"));

  console.log("--- Post Sign-in State ---");
  console.log("URL:          ", url);
  console.log("Clerk keys:   ", session.clerkKeys);
  console.log("Has session:  ", session.hasSession);
  console.log("Clerk cookies:", clerkCookies.map(c => `${c.name}=${c.value.slice(0, 30)}...`));
  console.log("Body preview: ", bodyText.slice(0, 300));

  expect(url).not.toBe("http://localhost:5173/");
});
