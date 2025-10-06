'use strict';

/**
 * Форматирует ZodError в читаемые сообщения на русском.
 * @param {import('zod').ZodError} error - ZodError объект
 * @returns {string} Основная ошибка + массив всех для лога
 */
const formatZodError = (error) => {
  const issues = error.issues || [];
  if (issues.length === 0) return 'Неизвестная ошибка валидации';

  // Форматируем каждую issue
  const formattedIssues = issues.map(issue => {
    const path = issue.path.join('.');  // e.g. "delivery.address"
    const message = issue.message || 'Неверный тип или значение';

    switch (issue.code) {
      case 'invalid_type':
        if (issue.received === 'undefined') {
          return `Поле ${path} отсутствует`;
        }
        return `Поле ${path} должно быть ${issue.expected}, получено ${issue.received}`;
      case 'too_small':
        if (issue.minimum === 1 && issue.type === 'string') {
          return `Поле ${path} не может быть пустым`;
        }
        return `Поле ${path} слишком короткое (минимум ${issue.minimum})`;
      case 'too_big':
        return `Поле ${path} слишком длинное (максимум ${issue.maximum})`;
      case 'custom':
        return `Ошибка в поле ${path}: ${message}`;
      default:
        return `Ошибка в поле ${path}: ${message}`;
    }
  });

  // Основная ошибка — первая
  const mainError = formattedIssues[0];
  console.log('[ZOD LOG] Все ошибки:', formattedIssues);  // Для dev-лога

  return mainError;
};

module.exports = formatZodError;