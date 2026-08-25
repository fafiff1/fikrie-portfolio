import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PLAYWRIGHT_PORT ?? "3001";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    storageState: { cookies: [], origins: [] },
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      testDir: "./tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        // Uses your installed Google Chrome — no `playwright install` download needed.
        channel: "chrome",
      },
    },
    {
      name: "api",
      testDir: "./tests/api",
      // Next.js dev server can return transient 500s during serial API runs on Windows.
      retries: 2,
      fullyParallel: false,
    },
    // Uncomment additional browsers after running: npx playwright install
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
  webServer: {
    // Webpack avoids intermittent Turbopack manifest errors on Windows during e2e runs.
    command: `npm run dev -- --port ${PORT} --webpack`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
