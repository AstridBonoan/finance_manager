/**
 * Shared Utilities for Finance Manager
 */

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Round number to 2 decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Clamp value between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num));
}

/**
 * Get month name from number (1-12)
 */
export function getMonthName(monthNum: number, locale: string = 'en-US'): string {
  return new Date(2024, monthNum - 1).toLocaleDateString(locale, { month: 'long' });
}

/**
 * Group array by key
 */
export function groupBy<T extends Record<string, any>>(array: T[], key: string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sum array of numbers
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}

/**
 * Calculate average
 */
export function average(numbers: number[]): number {
  return numbers.length === 0 ? 0 : sum(numbers) / numbers.length;
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(numbers: number[]): number {
  const avg = average(numbers);
  const squareDiffs = numbers.map((num) => Math.pow(num - avg, 2));
  return Math.sqrt(average(squareDiffs));
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delayMs?: number; backoffMultiplier?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 100, backoffMultiplier = 2 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      await sleep(delay);
    }
  }

  throw new Error('Retry failed');
}
