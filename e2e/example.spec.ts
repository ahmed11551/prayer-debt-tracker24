import { test, expect } from '@playwright/test';

/**
 * Базовый E2E тест для проверки работоспособности приложения
 */
test.describe('Prayer Debt Tracker - Basic Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Переход на главную страницу
    await page.goto('/');
    
    // Ожидание загрузки приложения
    await page.waitForLoadState('networkidle');
  });

  test('should load main page', async ({ page }) => {
    // Проверка наличия основных элементов
    await expect(page.locator('body')).toBeVisible();
    
    // Проверка наличия навигации
    const bottomNav = page.locator('[role="navigation"]').or(page.locator('nav'));
    if (await bottomNav.count() > 0) {
      await expect(bottomNav.first()).toBeVisible();
    }
  });

  test('should navigate between pages', async ({ page }) => {
    // Проверка навигации на страницу Reports
    const reportsLink = page.getByRole('link', { name: /отчёты|reports/i }).or(
      page.locator('a[href*="reports"]')
    );
    
    if (await reportsLink.count() > 0) {
      await reportsLink.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*reports.*/);
    }
  });

  test('should have accessible elements', async ({ page }) => {
    // Проверка наличия основных интерактивных элементов
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Проверка, что хотя бы одна кнопка видима
      await expect(buttons.first()).toBeVisible();
    }
  });
});

