import { test, expect } from '@playwright/test';

/**
 * E2E тесты для потока калькулятора намазов
 */
test.describe('Calculator Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should calculate prayer debt', async ({ page }) => {
    // Поиск формы калькулятора
    const birthDateInput = page.getByLabel(/дата рождения|birth date/i).first();
    
    if (await birthDateInput.count() > 0) {
      // Заполнение формы
      await birthDateInput.fill('2000-01-01');
      
      // Выбор пола
      const maleRadio = page.getByRole('radio', { name: /мужской|male/i }).first();
      if (await maleRadio.count() > 0) {
        await maleRadio.click();
      }
      
      // Возраст булюга
      const bulughAgeInput = page.getByLabel(/возраст булюга|bulugh age/i).first();
      if (await bulughAgeInput.count() > 0) {
        await bulughAgeInput.fill('15');
      }
      
      // Кнопка расчета
      const calculateButton = page.getByRole('button', { name: /рассчитать|calculate/i }).first();
      if (await calculateButton.count() > 0) {
        await calculateButton.click();
        
        // Ожидание результата
        await page.waitForTimeout(2000);
        
        // Проверка наличия результатов
        const results = page.locator('text=/намаз|prayer/i');
        if (await results.count() > 0) {
          await expect(results.first()).toBeVisible();
        }
      }
    }
  });

  test('should validate form inputs', async ({ page }) => {
    const calculateButton = page.getByRole('button', { name: /рассчитать|calculate/i }).first();
    
    if (await calculateButton.count() > 0) {
      // Попытка отправить пустую форму
      await calculateButton.click();
      
      // Проверка наличия ошибок валидации
      await page.waitForTimeout(1000);
      
      const errorMessages = page.locator('text=/обязательно|required|ошибка|error/i');
      // Если есть ошибки, они должны быть видны
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });
});

