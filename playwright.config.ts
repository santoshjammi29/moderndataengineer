import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

const PORT = Number(process.env.PW_PORT || 3099);
const BASE_URL = process.env.PW_BASE_URL || `http://127.0.0.1:${PORT}`;
const MAC_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function resolveLaunchOptions() {
  if (process.env.PW_EXECUTABLE_PATH) {
    return { executablePath: process.env.PW_EXECUTABLE_PATH };
  }
  if (!process.env.CI && process.platform === "darwin" && fs.existsSync(MAC_CHROME)) {
    return { executablePath: MAC_CHROME };
  }
  return {};
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  timeout: 45_000,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    launchOptions: resolveLaunchOptions(),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PW_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
