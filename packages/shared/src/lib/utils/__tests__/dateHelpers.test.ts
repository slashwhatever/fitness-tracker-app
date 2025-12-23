import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatRelativeDate,
  formatDateHeader,
  getMostRecentSetDate,
  formatLastSetDate,
  isSameDay,
  getDaysDifference
} from '../dateHelpers';

describe('dateHelpers', () => {
  beforeEach(() => {
    // Mock current date to Jan 15, 2024 for consistent testing
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatRelativeDate', () => {
    it('should return "Today" for today\'s date', () => {
      const today = new Date('2024-01-15T08:30:00Z');
      expect(formatRelativeDate(today)).toBe('Today');
    });

    it('should return "Today" for today\'s date as string', () => {
      const today = '2024-01-15T08:30:00Z';
      expect(formatRelativeDate(today)).toBe('Today');
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date('2024-01-14T20:00:00Z');
      expect(formatRelativeDate(yesterday)).toBe('Yesterday');
    });

    it('should return "X days ago" for dates within a week', () => {
      const threeDaysAgo = new Date('2024-01-12T10:00:00Z');
      expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago');
      
      const sixDaysAgo = new Date('2024-01-09T10:00:00Z');
      expect(formatRelativeDate(sixDaysAgo)).toBe('6 days ago');
    });

    it('should return formatted date for dates older than a week', () => {
      const oneWeekAgo = new Date('2024-01-08T10:00:00Z');
      expect(formatRelativeDate(oneWeekAgo)).toBe('Jan 8');
      
      const lastYear = new Date('2023-12-25T10:00:00Z');
      expect(formatRelativeDate(lastYear)).toBe('Dec 25, 2023');
    });

    it('should include year when date is from different year', () => {
      const lastYear = new Date('2023-06-15T10:00:00Z');
      expect(formatRelativeDate(lastYear)).toBe('Jun 15, 2023');
    });
  });

  describe('formatDateHeader', () => {
    it('should return "Today" for today\'s date', () => {
      const today = new Date('2024-01-15T08:30:00Z');
      expect(formatDateHeader(today)).toBe('Today');
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date('2024-01-14T20:00:00Z');
      expect(formatDateHeader(yesterday)).toBe('Yesterday');
    });

    it('should return formatted weekday for other dates', () => {
      const twoDaysAgo = new Date('2024-01-13T10:00:00Z');
      expect(formatDateHeader(twoDaysAgo)).toBe('Sat, Jan 13, 2024');
    });

    it('should handle string dates', () => {
      const dateString = '2024-01-13T10:00:00Z';
      expect(formatDateHeader(dateString)).toBe('Sat, Jan 13, 2024');
    });
  });

  describe('getMostRecentSetDate', () => {
    it('should return null for empty array', () => {
      expect(getMostRecentSetDate([])).toBeNull();
    });

    it('should return the most recent date from a single set', () => {
      const sets = [{ created_at: '2024-01-15T10:00:00Z' }];
      const result = getMostRecentSetDate(sets);
      expect(result).toEqual(new Date('2024-01-15T10:00:00Z'));
    });

    it('should return the most recent date from multiple sets', () => {
      const sets = [
        { created_at: '2024-01-10T10:00:00Z' },
        { created_at: '2024-01-15T10:00:00Z' },
        { created_at: '2024-01-12T10:00:00Z' }
      ];
      const result = getMostRecentSetDate(sets);
      expect(result).toEqual(new Date('2024-01-15T10:00:00Z'));
    });

    it('should work with sets that have additional properties', () => {
      const sets = [
        { created_at: '2024-01-10T10:00:00Z', reps: 10, weight: 100 },
        { created_at: '2024-01-15T10:00:00Z', reps: 8, weight: 105 },
        { created_at: '2024-01-12T10:00:00Z', reps: 12, weight: 95 }
      ];
      const result = getMostRecentSetDate(sets);
      expect(result).toEqual(new Date('2024-01-15T10:00:00Z'));
    });
  });

  describe('formatLastSetDate', () => {
    it('should return "No sets" for empty array', () => {
      expect(formatLastSetDate([])).toBe('No sets');
    });

    it('should format the most recent set date', () => {
      const sets = [
        { created_at: '2024-01-14T10:00:00Z' },
        { created_at: '2024-01-12T10:00:00Z' }
      ];
      expect(formatLastSetDate(sets)).toBe('Yesterday');
    });

    it('should handle a single set', () => {
      const sets = [{ created_at: '2024-01-15T10:00:00Z' }];
      expect(formatLastSetDate(sets)).toBe('Today');
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day with different times', () => {
      const date1 = new Date('2024-01-15T08:00:00Z');
      const date2 = new Date('2024-01-15T20:00:00Z');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2024-01-15T08:00:00Z');
      const date2 = new Date('2024-01-16T08:00:00Z');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should handle string dates', () => {
      const date1 = '2024-01-15T08:00:00Z';
      const date2 = '2024-01-15T20:00:00Z';
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should handle mixed date types', () => {
      const date1 = new Date('2024-01-15T08:00:00Z');
      const date2 = '2024-01-15T20:00:00Z';
      expect(isSameDay(date1, date2)).toBe(true);
    });
  });

  describe('getDaysDifference', () => {
    it('should return 0 for same day', () => {
      const fromDate = new Date('2024-01-15T08:00:00Z');
      const toDate = new Date('2024-01-15T20:00:00Z');
      expect(getDaysDifference(fromDate, toDate)).toBe(0);
    });

    it('should return positive number for future date', () => {
      const fromDate = new Date('2024-01-10T08:00:00Z');
      const toDate = new Date('2024-01-15T20:00:00Z');
      expect(getDaysDifference(fromDate, toDate)).toBe(5);
    });

    it('should return negative number for past date', () => {
      const fromDate = new Date('2024-01-20T08:00:00Z');
      const toDate = new Date('2024-01-15T20:00:00Z');
      expect(getDaysDifference(fromDate, toDate)).toBe(-5);
    });

    it('should use current date as default for toDate', () => {
      const fromDate = new Date('2024-01-10T08:00:00Z');
      // Current mocked date is 2024-01-15
      expect(getDaysDifference(fromDate)).toBe(5);
    });

    it('should handle string dates', () => {
      const fromDate = '2024-01-10T08:00:00Z';
      const toDate = '2024-01-15T20:00:00Z';
      expect(getDaysDifference(fromDate, toDate)).toBe(5);
    });

    it('should ignore time when calculating days', () => {
      const fromDate = new Date('2024-01-10T23:59:59Z');
      const toDate = new Date('2024-01-11T00:00:01Z');
      expect(getDaysDifference(fromDate, toDate)).toBe(1);
    });
  });
});