/**
 * Translate any thrown value into a short, friendly, encouraging message
 * suitable for showing to end users. Never exposes raw stack traces, DB errors,
 * or technical jargon. Logs the original to the console for debugging.
 */
export function friendlyError(
  err: unknown,
  fallback = "Something went wrong on our end. Please try again in a moment."
): string {
  if (typeof window !== 'undefined') {
    // Helpful for devs without leaking to the UI.
    // eslint-disable-next-line no-console
    console.error('[friendlyError]', err);
  }

  const raw =
    err instanceof Error ? err.message : typeof err === 'string' ? err : '';

  if (!raw) return fallback;

  // Network / offline
  if (/failed to fetch|network|networkerror|load failed|offline|aborted/i.test(raw)) {
    return "We couldn't reach our servers. Please check your connection and try again.";
  }
  // Timeout
  if (/timeout|timed out|etimedout/i.test(raw)) {
    return 'That took longer than expected — please try again.';
  }
  // Rate limit
  if (/rate|too many|429/i.test(raw)) {
    return 'You did that a bit too quickly. Please wait a moment and try again.';
  }
  // Verification
  if (/verif|code|invalid code|expired/i.test(raw)) {
    return raw.length < 140 ? raw : 'That code didn’t work. Please request a new one and try again.';
  }
  // Auth
  if (/unauthor|forbidden|sign ?in|log ?in/i.test(raw)) {
    return raw.length < 140 ? raw : 'You need to sign in to do that.';
  }
  // Conflict
  if (/already exists|conflict|409/i.test(raw)) {
    return raw.length < 140 ? raw : 'That already exists.';
  }
  // Database / Prisma — never show technical details
  if (/prisma|p\d{4}|database|ecconrefused|econnreset|relation .* does not exist|column .* does not exist/i.test(raw)) {
    return "Something went wrong on our end. We're sorry — please try again in a moment.";
  }
  // Validation
  if (/invalid|please|required|must/i.test(raw) && raw.length < 140) {
    return raw;
  }
  // Otherwise: only show if it's short and looks user-friendly already.
  if (raw.length > 0 && raw.length < 120 && !/Error:|at \w+|stack/i.test(raw)) {
    return raw;
  }
  return fallback;
}

/**
 * Parse a fetch Response into JSON and throw a friendly Error on failure.
 * Use in client handlers: `await jsonOrThrow(await fetch(...))`.
 */
export async function jsonOrThrow<T = unknown>(res: Response): Promise<T> {
  let data: { error?: string } & Record<string, unknown> = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    // ignore
  }
  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status}).`;
    throw new Error(msg);
  }
  return data as T;
}
