import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const localChrome = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    launchOptions: existsSync(localChrome) ? { executablePath: localChrome } : {},
    viewport: { width: 1440, height: 900 }
  },
  webServer: {
    command: 'npm run dev -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    timeout: 30000,
    reuseExistingServer: !process.env.CI
  }
});
