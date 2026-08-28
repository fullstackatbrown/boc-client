import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end configuration.
 *
 * Boots BOTH halves of the stack, since almost nothing on this site renders without
 * the Express server. Both are started with their test flags on:
 *   - boc-server with DEVELOPING, enabling the `e2e:<email>` bearer token bypass
 *   - next dev with NEXT_PUBLIC_E2E=1, enabling the matching browser login
 *
 * Note this runs against the ordinary `boc` database and reseeds it (see
 * globalSetup), so local development data is replaced when the suite runs.
 */
const SERVER_DIR = "../boc-server";

export default defineConfig({
  testDir: "./e2e",
  // Keep failure artifacts (screenshots, traces) alongside the tests rather than
  // dropping a test-results/ folder at the repo root.
  outputDir: "./e2e/test-results",
  // The lifecycle walk is one long ordered story; running its steps in parallel or
  // retrying a step in isolation would be meaningless.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 90_000,
  expect: { timeout: 10_000 },

  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: "http://localhost:3000",
    // The site is desktop-only; layouts assume at least 1150px.
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: [
    {
      command: "node server.mjs",
      cwd: SERVER_DIR,
      url: "http://localhost:8080/trips",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { DEVELOPING: "1" },
    },
    {
      command: "npx next dev -p 3000",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { NEXT_PUBLIC_E2E: "1" },
    },
  ],
});
