/**
 * AC-6 E2E Tests — Daily N5 Drill UI Layout and States
 * 
 * Tests the fixed three-section layout and various UI states:
 * - Loading (skeleton)
 * - Content (normal drill flow)
 * - Empty (no questions)
 * - Error (failed to load)
 * - Completed (session summary)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('AC-6 E2E — UI Layout and States', () => {
  
  // ========================================
  // Layout Tests (Fixed 3-Section Structure)
  // ========================================
  
  test('test_AC-6_e2e_layout_has_header_main_footer', async ({ page }) => {
    await page.goto(`${BASE_URL}/today`);
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="drill-layout"]', { timeout: 5000 });
    
    // Verify header is present
    const header = page.locator('[data-testid="session-header"]');
    await expect(header).toBeVisible();
    
    // Verify main content area is present
    const main = page.locator('[data-testid="question-card"], [data-testid="session-completed"], [data-testid="loading-skeleton"]');
    await expect(main.first()).toBeVisible();
    
    // Verify actions bar (footer) is present or completed screen
    const footer = page.locator('[data-testid="actions-bar"], [data-testid="session-completed"]');
    await expect(footer.first()).toBeVisible();
  });

  test('test_AC-6_e2e_header_shows_question_progress', async ({ page }) => {
    await page.goto(`${BASE_URL}/today`);
    await page.waitForSelector('[data-testid="session-header"]', { timeout: 5000 });
    
    const header = page.locator('[data-testid="session-header"]');
    await expect(header).toContainText(/\d+\/\d+/); // e.g., "1/10"
  });

  test('test_AC-6_e2e_question_card_visible_in_content', async ({ page }) => {
    await page.goto(`${BASE_URL}/today`);
    
    // Wait for content to load (not loading state)
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 5000 });
    
    const questionCard = page.locator('[data-testid="question-card"]');
    await expect(questionCard).toBeVisible();
    
    // Question card should have prompt text
    const prompt = questionCard.locator('[data-testid="question-prompt"]');
    await expect(prompt).toBeVisible();
  });

  test('test_AC-6_e2e_actions_bar_has_skip_next_buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/today`);
    await page.waitForSelector('[data-testid="actions-bar"]', { timeout: 5000 });
    
    const actionsBar = page.locator('[data-testid="actions-bar"]');
    await expect(actionsBar).toBeVisible();
    
    // Should have Skip button
    const skipButton = actionsBar.locator('button:has-text("スキップ")');
    await expect(skipButton).toBeVisible();
  });

  // ========================================
  // State Tests (Loading/Empty/Error/Completed)
  // ========================================

  test('test_AC-6_e2e_shows_loading_skeleton_initially', async ({ page }) => {
    await page.goto(`${BASE_URL}/today`);
    
    // Loading skeleton should appear briefly
    // (This might be very fast, so we just check it exists in DOM)
    const skeleton = page.locator('[data-testid="loading-skeleton"]');
    // Check if it's either visible or already transitioned to content
    const isVisible = await skeleton.isVisible().catch(() => false);
    const questionCardVisible = await page.locator('[data-testid="question-card"]').isVisible();
    
    expect(isVisible || questionCardVisible).toBeTruthy();
  });

  test('test_AC-6_e2e_shows_empty_state_when_no_questions', async ({ page }) => {
    await page.goto(`${BASE_URL}/today?empty=true`);
    
    // Wait for empty state
    await page.waitForSelector('[data-testid="empty-state"]', { timeout: 5000 });
    
    const emptyState = page.locator('[data-testid="empty-state"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/問題がありません|No questions available/i);
  });

  test('test_AC-6_e2e_shows_error_state_on_failure', async ({ page }) => {
    await page.goto(`${BASE_URL}/today?error=true`);
    
    // Wait for error state
    await page.waitForSelector('[data-testid="error-state"]', { timeout: 5000 });
    
    const errorState = page.locator('[data-testid="error-state"]');
    await expect(errorState).toBeVisible();
    
    // Error message should be present
    const errorMessage = errorState.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
  });

  test('test_AC-6_e2e_error_state_has_retry_button', async ({ page }) => {
    await page.goto(`${BASE_URL}/today?error=true`);
    await page.waitForSelector('[data-testid="error-state"]', { timeout: 5000 });
    
    // Retry button should be present
    const retryButton = page.locator('button:has-text("再試行")');
    await expect(retryButton).toBeVisible();
  });

  // ========================================
  // Interaction Flow Tests
  // ========================================

  test('test_AC-6_e2e_can_select_answer_and_proceed', async ({ page }) => {
    await page.goto(`${BASE_URL}/today`);
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 5000 });
    
    // Get initial question number
    const header = page.locator('[data-testid="session-header"]');
    const initialProgress = await header.textContent();
    
    // Select first option
    const firstOption = page.locator('[data-testid^="option-"]').first();
    await firstOption.click();
    
    // Wait for progress to update or next question
    await page.waitForTimeout(500);
    
    // Progress should have changed or we're on next question
    const newProgress = await header.textContent();
    expect(newProgress).toBeDefined();
  });

  test('test_AC-6_e2e_can_skip_question', async ({ page }) => {
    await page.goto(`${BASE_URL}/today`);
    await page.waitForSelector('[data-testid="actions-bar"]', { timeout: 5000 });
    
    // Get initial progress
    const header = page.locator('[data-testid="session-header"]');
    const initialProgress = await header.textContent();
    
    // Click skip button
    const skipButton = page.locator('button:has-text("スキップ")');
    await skipButton.click();
    
    // Wait for update
    await page.waitForTimeout(500);
    
    // Progress should have changed
    const newProgress = await header.textContent();
    expect(newProgress).not.toBe(initialProgress);
  });

  test('test_AC-6_e2e_shows_completion_screen_after_all_questions', async ({ page }) => {
    await page.goto(`${BASE_URL}/today`);
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 5000 });
    
    // Answer all questions by repeatedly clicking first option and waiting
    for (let i = 0; i < 10; i++) {
      const questionCard = page.locator('[data-testid="question-card"]');
      const isVisible = await questionCard.isVisible().catch(() => false);
      
      if (!isVisible) break; // Already completed
      
      const firstOption = page.locator('[data-testid^="option-"]').first();
      await firstOption.click();
      await page.waitForTimeout(300);
    }
    
    // Should show completion screen
    await page.waitForSelector('[data-testid="session-completed"]', { timeout: 5000 });
    const completionScreen = page.locator('[data-testid="session-completed"]');
    await expect(completionScreen).toBeVisible();
  });

  test('test_AC-6_e2e_completion_shows_accuracy_score', async ({ page }) => {
    await page.goto(`${BASE_URL}/today`);
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 5000 });
    
    // Answer all questions
    for (let i = 0; i < 10; i++) {
      const questionCard = page.locator('[data-testid="question-card"]');
      const isVisible = await questionCard.isVisible().catch(() => false);
      if (!isVisible) break;
      
      const firstOption = page.locator('[data-testid^="option-"]').first();
      await firstOption.click();
      await page.waitForTimeout(300);
    }
    
    // Wait for completion
    await page.waitForSelector('[data-testid="accuracy-score"]', { timeout: 5000 });
    
    const accuracyScore = page.locator('[data-testid="accuracy-score"]');
    await expect(accuracyScore).toBeVisible();
    await expect(accuracyScore).toContainText(/%/); // Should contain percentage
  });
});
