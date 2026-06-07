/**
 * Extracts a human-readable message from an API error response.
 * Handles .NET ProblemDetails (detail / title) and custom error shapes (error / message).
 * Returns `fallback` when no recognisable field is found.
 */
export function extractApiError(err: unknown, fallback: string): string {
  const body = (err as { error?: Record<string, unknown> })?.error;
  if (!body) return fallback;
  // .NET ProblemDetails: prefer detail > title; custom: error > message
  if (typeof body['detail'] === 'string') return body['detail'];
  if (typeof body['title'] === 'string') return body['title'];
  if (typeof body['error'] === 'string') return body['error'];
  if (typeof body['message'] === 'string') return body['message'];
  return fallback;
}
