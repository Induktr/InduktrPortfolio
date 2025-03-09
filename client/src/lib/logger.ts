/**
 * Модуль для логирования с временными метками
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Логирует сообщение с временной меткой
 * @param level - Уровень логирования
 * @param message - Сообщение для лога
 * @param data - Дополнительные данные (опционально)
 */
export function logWithTimestamp(level: LogLevel, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logPrefix = `[${timestamp}]`;

  switch (level) {
    case 'debug':
      console.debug(logPrefix, message, data !== undefined ? data : '');
      break;
    case 'info':
      console.log(logPrefix, message, data !== undefined ? data : '');
      break;
    case 'warn':
      console.warn(logPrefix, message, data !== undefined ? data : '');
      break;
    case 'error':
      console.error(logPrefix, message, data !== undefined ? data : '');
      break;
  }
}

/**
 * Логирует ошибку с временной меткой и стек-трейсом
 * @param message - Сообщение об ошибке
 * @param error - Объект ошибки
 */
export function logError(message: string, error: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${message}`, error);
  if (error?.stack) {
    console.error(`[${timestamp}] Stack trace:`, error.stack);
  }
}

/**
 * Измеряет время выполнения функции и логирует результат
 * @param name - Название операции
 * @param fn - Функция для выполнения
 * @returns Результат функции
 */
export async function measurePerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logWithTimestamp('info', `Performance: ${name} took ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logWithTimestamp('error', `Performance: ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

export default {
  logWithTimestamp,
  logError,
  measurePerformance
}; 