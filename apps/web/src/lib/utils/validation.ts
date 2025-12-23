/**
 * Validates if a string is a proper UUID format and not a temporary optimistic ID
 * @param id - The ID to validate
 * @returns true if the ID is a valid UUID, false otherwise
 */
export function isValidUUID(id: string | null | undefined): boolean {
  if (!id) return false;
  
  // Exclude temporary IDs used in optimistic updates
  if (id.startsWith('temp-')) return false;
  
  // Check UUID format (case insensitive)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Checks if an ID is safe for database queries (valid UUID, not temporary)
 * @param id - The ID to check
 * @returns true if safe to use in queries, false otherwise
 */
export function isSafeForQueries(id: string | null | undefined): boolean {
  return Boolean(id && isValidUUID(id));
}