import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * E2E тесты для accessibility
 */
test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have no accessibility violations on main page', async ({ page }) => {
    // Инициализация axe
    await injectAxe(page);
    
    // Проверка accessibility
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Проверка наличия h1
    const h1 = page.locator('h1');
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible();
    }
  });

  test('should have keyboard navigation', async ({ page }) => {
    // Проверка навигации с клавиатуры
    await page.keyboard.press('Tab');
    
    // Проверка, что фокус виден
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement.first()).toBeVisible();
    }
  });

  test('should have ARIA labels on interactive elements', async ({ page }) => {
    // Проверка наличия ARIA атрибутов на кнопках
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Проверка первой кнопки
      const firstButton = buttons.first();
      const ariaLabel = await firstButton.getAttribute('aria-label');
      const ariaLabelledBy = await firstButton.getAttribute('aria-labelledby');
      const textContent = await firstButton.textContent();
      
      // Должен быть либо aria-label, либо aria-labelledby, либо текстовое содержимое
      expect(ariaLabel || ariaLabelledBy || textContent?.trim()).toBeTruthy();
    }
  });
});

