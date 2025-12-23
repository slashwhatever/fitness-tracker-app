/**
 * Date utility functions for consistent date handling across the app
 */

/**
 * Formats a date relative to now (Today, Yesterday, X days ago, or formatted date)
 * @param date - The date to format (Date object or ISO string)
 * @returns Human-readable relative date string
 */
export function formatRelativeDate(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Reset time to start of day for accurate day comparison
  const targetDateStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffInMs = nowStart.getTime() - targetDateStart.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return targetDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

/**
 * Formats a date for display in set history (Today, Yesterday, or formatted date)
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date string for set history display
 */
export function formatDateHeader(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's today
  if (targetDate.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if it's yesterday
  if (targetDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Format as "MON, 25 DEC 2023"
  return targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(',', ',');
}

/**
 * Gets the most recent date from an array of sets
 * @param sets - Array of sets with created_at timestamps
 * @returns The most recent date, or null if no sets
 */
export function getMostRecentSetDate<T extends { created_at: string }>(sets: T[]): Date | null {
  if (sets.length === 0) {
    return null;
  }
  
  // Sets are usually ordered by created_at desc, but let's be safe
  const mostRecentSet = sets.reduce((latest, current) => {
    return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
  });
  
  return new Date(mostRecentSet.created_at);
}

/**
 * Formats the last set date for a movement
 * @param sets - Array of sets for the movement
 * @returns Formatted relative date or "No sets"
 */
export function formatLastSetDate<T extends { created_at: string }>(sets: T[]): string {
  const mostRecentDate = getMostRecentSetDate(sets);
  
  if (!mostRecentDate) {
    return "No sets";
  }
  
  return formatRelativeDate(mostRecentDate);
}

/**
 * Checks if two dates are on the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are on the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d1.toDateString() === d2.toDateString();
}

/**
 * Gets the number of days between two dates
 * @param fromDate - Start date
 * @param toDate - End date (defaults to now)
 * @returns Number of days difference
 */
export function getDaysDifference(fromDate: Date | string, toDate: Date | string = new Date()): number {
  const from = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;
  const to = typeof toDate === 'string' ? new Date(toDate) : toDate;
  
  // Reset time to start of day for accurate day comparison
  const fromStart = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toStart = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  
  const diffInMs = toStart.getTime() - fromStart.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}