import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: process.env.BASE_URL || 'http://localhost:47391' },
  webServer: process.env.BASE_URL ? undefined : {
    command: 'node scripts/serve.mjs',
    url: 'http://localhost:47391',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
    { name: 'pixel', use: { ...devices['Pixel 7'] } },
  ],
});
