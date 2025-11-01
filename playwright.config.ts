import { defineConfig } from '@playwright/test';

// Allow overriding port/baseURL from env for local runs.
const E2E_PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 3001;
const E2E_BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${E2E_PORT}`;

const SKIP_WEBSERVER = process.env.PW_NO_WEBSERVER === '1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['line']],
  use: {
    headless: true,
    baseURL: E2E_BASE_URL,
  },
  webServer: SKIP_WEBSERVER
    ? undefined
    : {
        command: `PORT=${E2E_PORT} npm run dev`,
        // Important: point to an existing route (root returns 404 in this app)
        url: `${E2E_BASE_URL}/today`,
        reuseExistingServer: true,
        timeout: 120 * 1000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
