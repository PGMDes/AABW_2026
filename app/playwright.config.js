import { defineConfig, devices } from "@playwright/test"

const baseURL =
  globalThis.process?.env?.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4180"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: [["list"]],
  timeout: 45_000,
  expect: {
    timeout: 7_500,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
