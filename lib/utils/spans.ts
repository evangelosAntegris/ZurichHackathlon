/**
 * Utilities to find evidence spans for short substrings in a larger text.
 * Helpful when an LLM returns request lines without offsets.
 */

/** Find the first approximate match of `needle` in `haystack` (basic). */
export function findSpan(haystack: string, needle: string) {
  const idx = haystack.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return null;
  return { start: idx, end: idx + needle.length };
}

/** Build spans for a list of strings; skips those not found. */
export function spansForList(haystack: string, items: string) {
  const spans: { start: number; end: number }[] = [];
  for (const req of items) {
    const span = findSpan(haystack, req);
    if (span) spans.push(span);
  }
  return spans;
}
