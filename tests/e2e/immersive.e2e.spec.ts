import { test, expect } from '@playwright/test';

test.describe('Immersive Snake Mode', () => {
  test('should render shell, language panel, and snake canvas', async ({ page }) => {
    await page.goto('/immersive?immersive_snake=1');

    const shell = page.getByTestId('immersive-shell');
    await expect(shell).toBeVisible();

    const lang = page.getByTestId('language-panel');
    await expect(lang).toBeVisible();

    const canvas = page.getByTestId('snake-canvas');
    await expect(canvas).toBeVisible();

    // Pause then resume to ensure controls work
    const pauseBtn = page.getByRole('button', { name: 'Pause' });
    await expect(pauseBtn).toBeVisible();
    await pauseBtn.click();
    const resumeBtn = page.getByRole('button', { name: 'Resume' });
    await expect(resumeBtn).toBeVisible();
  });
});
