import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Cleans up error messages by removing technical prefixes and suffixes.
 * Removes Convex-specific prefixes, request IDs, stack traces, etc.
 */
function cleanErrorMessage(message: string): string {
  let cleaned = message;

  // Remove Request ID patterns: [Request ID: ...]
  cleaned = cleaned.replace(/\[Request ID: [^\]]+\]\s*/g, '');

  // Remove "Server Error" text
  cleaned = cleaned.replace(/Server Error\s*/gi, '');

  // Remove "Uncaught Error:" text
  cleaned = cleaned.replace(/Uncaught Error:\s*/gi, '');

  // Remove Convex error prefixes: [CONVEX M(...)]
  cleaned = cleaned.replace(/\[CONVEX[^\]]+\]\s*/g, '');

  // Remove "at handler" and everything after (file paths, line numbers)
  const atHandlerIndex = cleaned.indexOf(' at handler');
  if (atHandlerIndex > 0) {
    cleaned = cleaned.substring(0, atHandlerIndex);
  }

  // Remove file paths in parentheses: (../../path/to/file.ts:line:col)
  cleaned = cleaned.replace(/\s*\([^)]*\.(ts|js|tsx|jsx):\d+:\d+\)/g, '');

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Extracts a user-friendly error message from various error formats.
 * Handles Error objects, strings, Convex errors, and unknown error types.
 *
 * @param error - The error to extract a message from
 * @param defaultMessage - The default message to return if extraction fails
 * @returns A user-friendly error message string
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'An error occurred. Please try again.',
): string {
  let rawMessage: string | undefined;

  if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === 'string') {
    rawMessage = error;
  } else if (error && typeof error === 'object') {
    // Try to extract message from various Convex error formats
    const err = error as {
      message?: string;
      data?: { message?: string };
      cause?: { message?: string };
      error?: string;
    };

    rawMessage =
      err.message ||
      err.data?.message ||
      err.cause?.message ||
      err.error;
  }

  if (rawMessage) {
    const cleaned = cleanErrorMessage(rawMessage);
    return cleaned || defaultMessage;
  }

  return defaultMessage;
}
