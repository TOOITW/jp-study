/**
 * AC-6 E2E — Daily Drill UI Layout Validation
 * Red: Expected to fail until UI page is implemented
 *
 * Tests that the drill page has proper layout structure (header/body/footer)
 * and renders correctly in different states.
 */

import { test, expect } from '@playwright/test';

test.describe('AC-6 E2E — Daily Drill UI Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the daily drill page
    await page.goto('http://localhost:3000/today', { waitUntil: 'networkidle' });
  });

  test('test_AC-6_e2e_layout_header_body_footer_present', async ({ page }) => {
    // Check for header section (e.g., SessionHeader component)
    const header = page.locator('[data-testid="drill-header"]');
    await expect(header).toBeVisible();

    // Check for middle/body section (e.g., QuestionCard or skeleton)
    const body = page.locator('[data-testid="drill-body"]');
    await expect(body).toBeVisible();

    // Check for footer/actions section (e.g., ActionsBar component)
    const footer = page.locator('[data-testid="drill-actions"]');
    await expect(footer).toBeVisible();

    // Verify basic layout structure is present
    const layout = page.locator('[data-testid="drill-layout"]');
    await expect(layout).toBeVisible();
  });

  test('test_AC-6_e2e_layout_states_skeleton_loading', async ({ page }) => {
    // When page loads, expect skeleton or loading state
    const skeleton = page.locator('[data-testid="skeleton-state"]');
    const loading = page.locator('[data-testid="loading-state"]');

    // Either skeleton or loading indicator should be visible initially
    const isSkeletonVisible = await skeleton.isVisible().catch(() => false);
    const isLoadingVisible = await loading.isVisible().catch(() => false);

    expect(isSkeletonVisible || isLoadingVisible).toBeTruthy();

    // Eventually the content should load
    await page.waitForTimeout(2000);
    const contentLoaded = await page.locator('[data-testid="question-card"]').isVisible().catch(() => false);
    expect(contentLoaded).toBeTruthy();
  });

  test('test_AC-6_e2e_layout_states_error_handling', async ({ page }) => {
    // Simulate network error by blocking requests
    await page.route('**/api/**', route => route.abort());

    // Reload page to trigger error
    await page.reload();

    // Expect error state to be visible
    const errorState = page.locator('[data-testid="error-state"]');
    await expect(errorState).toBeVisible({ timeout: 5000 });

    // Error message should be informative
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toContainText(/error|failed|unable/i);
  });

  test('test_AC-6_e2e_layout_states_empty_state', async ({ page }) => {
    // Navigate to empty/no questions scenario (if available)
    // For now, this test checks that layout handles empty state gracefully

    const emptyState = page.locator('[data-testid="empty-state"]');
    const isEmptyStateVisible = await emptyState.isVisible().catch(() => false);

    // If empty state is displayed, verify it has proper structure
    if (isEmptyStateVisible) {
      const emptyMessage = page.locator('[data-testid="empty-message"]');
      await expect(emptyMessage).toBeVisible();
    } else {
      // If not empty state, verify normal layout is present
      const layout = page.locator('[data-testid="drill-layout"]');
      await expect(layout).toBeVisible();
    }
  });
});
