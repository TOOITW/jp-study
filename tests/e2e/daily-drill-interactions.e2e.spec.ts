/**
 * AC-6 E2E — Daily Drill UI Interactions
 * Red: Expected to fail until UI components are implemented
 *
 * Tests user interactions like answering questions and form submission.
 */

import { test, expect } from '@playwright/test';

test.describe('AC-6 E2E — Daily Drill UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the daily drill page
    await page.goto('http://localhost:3000/today', { waitUntil: 'networkidle' });
    // Wait for content to load
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 5000 }).catch(() => {});
  });

  test('test_AC-6_e2e_answer_single_choice_question', async ({ page }) => {
    // Find the question card
    const questionCard = page.locator('[data-testid="question-card"]');
    await expect(questionCard).toBeVisible();

    // Verify question text is displayed
    const questionText = page.locator('[data-testid="question-text"]');
    await expect(questionText).toBeVisible();

    // Find options (for single choice)
    const options = page.locator('[data-testid="answer-option"]');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    // Select first option
    const firstOption = page.locator('[data-testid="answer-option"]').first();
    await firstOption.click();

    // Verify selection state
    await expect(firstOption).toHaveAttribute('data-selected', 'true');
  });

  test('test_AC-6_e2e_submit_answer_button', async ({ page }) => {
    // Wait for question to load
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 5000 }).catch(() => {});

    // Select an answer
    const firstOption = page.locator('[data-testid="answer-option"]').first();
    if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstOption.click();
    }

    // Find and click submit button
    const submitButton = page.locator('[data-testid="submit-answer-button"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Verify feedback is shown
    const feedback = page.locator('[data-testid="answer-feedback"]');
    await expect(feedback).toBeVisible({ timeout: 3000 });
  });

  test('test_AC-6_e2e_navigation_next_question', async ({ page }) => {
    // Wait for question to load
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 5000 }).catch(() => {});

    // Get current question ID
    const currentQuestion = page.locator('[data-testid="question-card"]');
    const currentId = await currentQuestion.getAttribute('data-question-id');

    // Find and click next button
    const nextButton = page.locator('[data-testid="next-question-button"]');
    const isNextVisible = await nextButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (isNextVisible) {
      await nextButton.click();

      // Wait for new question to load
      await page.waitForTimeout(500);

      // Verify new question is displayed (or session completed)
      const newQuestion = page.locator('[data-testid="question-card"]');
      const completedMessage = page.locator('[data-testid="session-completed"]');

      const isNewQuestionVisible = await newQuestion.isVisible({ timeout: 2000 }).catch(() => false);
      const isCompletedVisible = await completedMessage.isVisible({ timeout: 2000 }).catch(() => false);

      expect(isNewQuestionVisible || isCompletedVisible).toBeTruthy();
    }
  });

  test('test_AC-6_e2e_progress_indicator', async ({ page }) => {
    // Wait for question to load
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 5000 }).catch(() => {});

    // Check for progress indicator
    const progressBar = page.locator('[data-testid="progress-bar"]');
    const progressText = page.locator('[data-testid="progress-text"]');

    // Either progress bar or progress text should be visible
    const hasProgressBar = await progressBar.isVisible({ timeout: 2000 }).catch(() => false);
    const hasProgressText = await progressText.isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasProgressBar || hasProgressText).toBeTruthy();

    // If progress text, verify it shows "X of Y" format
    if (hasProgressText) {
      const text = await progressText.textContent();
      expect(text).toMatch(/\d+\s+of\s+\d+/);
    }
  });
});
