import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright конфигурация для E2E тестов
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Максимальное время для одного теста */
  timeout: 30 * 1000,
  expect: {
    /* Максимальное время для expect() */
    timeout: 5000
  },
  /* Запускать тесты в файлах параллельно */
  fullyParallel: true,
  /* Не запускать тесты в CI, если они упали */
  forbidOnly: !!process.env.CI,
  /* Retry только в CI */
  retries: process.env.CI ? 2 : 0,
  /* Оптимизация для CI */
  workers: process.env.CI ? 1 : undefined,
  /* Репортер для результатов */
  reporter: [
    ['html'],
    ['list'],
    process.env.CI ? ['github'] : ['json', { outputFile: 'test-results.json' }]
  ],
  /* Общие настройки для всех проектов */
  use: {
    /* Базовый URL для тестов */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:8080',
    /* Собирать trace при повторе неудачного теста */
    trace: 'on-first-retry',
    /* Скриншоты при ошибках */
    screenshot: 'only-on-failure',
    /* Видео при ошибках */
    video: 'retain-on-failure',
  },

  /* Настройка проектов для разных браузеров */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Мобильные устройства */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Запуск dev сервера перед тестами */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

