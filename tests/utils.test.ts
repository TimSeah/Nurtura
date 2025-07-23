import { describe, expect, test } from 'vitest';
import { calculateDaysAgo } from '../src/utils/calDaysAgoUtil';


describe('Unit test: calculateDaysAgo', () => {
  test('returns "Today" for current date', () => {
    const now = new Date().toISOString();
    expect(calculateDaysAgo(now)).toBe('Today');
  });

  test('returns "1 day ago" for yesterday', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(calculateDaysAgo(yesterday)).toBe('1 day ago');
  });

  test('returns correct days ago for N days', () => {
    const n = 5;
    const nDaysAgo = new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
    expect(calculateDaysAgo(nDaysAgo)).toBe(`${n} days ago`);
  });
});
