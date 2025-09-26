/**
 * Pure text utilities used by the Preprocessing Agent.
 * Keep stateless and easily testable.
 */

/** Collapse excessive whitespace and normalize quotes/punctuation. */
export function normalizeWhitespace(input: string): string {
  // Normalize ASCII quotes; collapse whitespace; trim
  return input
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n") // keep paragraph breaks but trim
    .trim();
}

/** Very simple sentence splitter (fallback). Replace later with a better splitter if needed. */
export function simpleSentenceSplit(input: string): string[] {
  // Split on ., !, ? followed by space/newline; keep short sentences out
  const raw = input.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Ý])/g);
  return raw.map(s => s.trim()).filter(Boolean);
}

/** Remove typical fillers; keep semantic content. */
export function removeFillers(input: string): string {
  // Minimal multilingual fillers; extend as needed
  const fillers = /\b(uhm+|äh+|erm+|mmm+|you know|so to speak|diciamo|cioè)\b/gi;
  return input.replace(fillers, "").replace(/\s{2,}/g, " ");
}
