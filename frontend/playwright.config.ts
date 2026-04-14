import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

const projects: PlaywrightTestConfig["projects"] = [
    {
        name: "chromium",
        use: { ...devices["Desktop Chrome"] },
    },
    {
        name: "android-chrome",
        use: {
            ...devices["Pixel 7"],
            browserName: "chromium" as const,
        },
    },
    {
        name: "ios-touch",
        use: {
            ...devices["iPhone 13"],
            browserName: "chromium" as const,
        },
    },
];

if (process.env.PLAYWRIGHT_ENABLE_WEBKIT === "true") {
    projects.push({
        name: "ios-safari",
        use: {
            ...devices["iPhone 13"],
            browserName: "webkit" as const,
        },
    });
}

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: "http://127.0.0.1:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects,
    webServer: {
        command: "pnpm run dev -- --hostname 127.0.0.1 --port 3000",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
