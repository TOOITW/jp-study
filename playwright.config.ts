import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  reporter: [['list']],
  use: {
    headless: true,
    // 禁用 NextJS 開發覆蓋層
    launchOptions: {
      args: ['--disable-dev-shm-usage'],
    },
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});

