/**
 * Утилиты для валидации и санитизации пользовательского ввода
 * Защита от XSS, инъекций и некорректных данных
 */

/**
 * Санитизация строки - удаление потенциально опасных символов
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Удаляем HTML теги и опасные символы
  return input
    .replace(/<[^>]*>/g, '') // Удаляем HTML теги
    .replace(/[<>]/g, '') // Удаляем оставшиеся угловые скобки
    .replace(/javascript:/gi, '') // Удаляем javascript: протокол
    .replace(/on\w+=/gi, '') // Удаляем обработчики событий (onclick, onerror и т.д.)
    .replace(/&/g, '&amp;') // Экранируем амперсанды
    .trim()
    .slice(0, 1000); // Ограничиваем длину
}

/**
 * Валидация числа - проверка на корректное положительное целое число
 */
export function validatePositiveInteger(value: string | number): { valid: boolean; value?: number; error?: string } {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      return { valid: false, error: 'Число должно быть корректным' };
    }
    if (value < 0) {
      return { valid: false, error: 'Число не может быть отрицательным' };
    }
    if (value % 1 !== 0) {
      return { valid: false, error: 'Число должно быть целым' };
    }
    if (value > 999999) {
      return { valid: false, error: 'Число слишком большое (максимум 999,999)' };
    }
    return { valid: true, value: Math.floor(value) };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return { valid: false, error: 'Поле не может быть пустым' };
    }

    // Проверяем на XSS попытки
    if (/<|>|script|javascript|on\w+/i.test(trimmed)) {
      return { valid: false, error: 'Некорректный ввод' };
    }

    const num = Number(trimmed);
    if (isNaN(num) || !isFinite(num)) {
      return { valid: false, error: 'Введите корректное число' };
    }
    if (num < 0) {
      return { valid: false, error: 'Число не может быть отрицательным' };
    }
    if (num % 1 !== 0) {
      return { valid: false, error: 'Число должно быть целым' };
    }
    if (num > 999999) {
      return { valid: false, error: 'Число слишком большое (максимум 999,999)' };
    }
    return { valid: true, value: Math.floor(num) };
  }

  return { valid: false, error: 'Некорректный тип данных' };
}

/**
 * Валидация текстового поля
 */
export function validateTextField(input: string, maxLength: number = 200): { valid: boolean; value?: string; error?: string } {
  if (typeof input !== 'string') {
    return { valid: false, error: 'Поле должно быть текстом' };
  }

  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Поле не может быть пустым' };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `Максимальная длина: ${maxLength} символов` };
  }

  // Проверка на XSS
  if (/<[^>]*>|javascript:|on\w+=/i.test(trimmed)) {
    return { valid: false, error: 'Некорректный ввод' };
  }

  return { valid: true, value: sanitizeString(trimmed) };
}

/**
 * Валидация даты
 */
export function validateDate(dateString: string): { valid: boolean; date?: Date; error?: string } {
  if (!dateString || typeof dateString !== 'string') {
    return { valid: false, error: 'Дата не указана' };
  }

  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Некорректная дата' };
  }

  // Дата не может быть в будущем (для даты рождения)
  if (date > new Date()) {
    return { valid: false, error: 'Дата не может быть в будущем' };
  }

  // Дата не может быть слишком старой (более 150 лет назад)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 150);
  if (date < minDate) {
    return { valid: false, error: 'Дата слишком старая' };
  }

  return { valid: true, date };
}

/**
 * Безопасный рендеринг текста (замена опасных символов)
 */
export function safeRender(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Проверка на пустое значение
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  if (typeof value === 'number') {
    return isNaN(value);
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false;
}

