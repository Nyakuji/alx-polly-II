// ✅ SECURITY: Security utilities for safe error handling and data sanitization

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string with dangerous characters removed
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates UUID format
 * @param uuid - UUID to validate
 * @returns boolean indicating if UUID is valid
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Safely handles errors without exposing sensitive information
 * @param error - The error to handle
 * @param context - Context for logging (not exposed to user)
 * @returns Safe error message for user
 */
export function handleSecurityError(error: unknown, context: string = 'operation'): string {
  console.error(`Security error in ${context}:`, error);
  
  // Don't expose internal error details to users
  if (error instanceof Error) {
    // Only expose safe, user-friendly messages
    if (error.message.includes('duplicate') || error.message.includes('already exists')) {
      return 'This item already exists. Please try again.';
    }
    if (error.message.includes('not found')) {
      return 'The requested item was not found.';
    }
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return 'You do not have permission to perform this action.';
    }
  }
  
  // Default safe message
  return 'An error occurred. Please try again later.';
}

/**
 * Validates poll ID format
 * @param pollId - Poll ID to validate
 * @returns boolean indicating if poll ID is valid
 */
export function isValidPollId(pollId: string): boolean {
  return typeof pollId === 'string' && 
         pollId.length > 0 && 
         pollId.length <= 50 && 
         /^[a-zA-Z0-9_-]+$/.test(pollId);
}

/**
 * Validates option index
 * @param index - Option index to validate
 * @param maxOptions - Maximum number of options
 * @returns boolean indicating if index is valid
 */
export function isValidOptionIndex(index: number, maxOptions: number): boolean {
  return typeof index === 'number' && 
         Number.isInteger(index) && 
         index >= 0 && 
         index < maxOptions;
}

/**
 * Generates a secure random string for tokens/IDs
 * @param length - Length of the string to generate
 * @returns Secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  
  return result;
}
