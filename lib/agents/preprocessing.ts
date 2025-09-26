/**
 * Preprocessing Agent
 * -------------------
 * Why:
 *   Downstream agents (IE, Classifier, Validation) benefit from a clean,
 *   normalized transcript and a detected language. This reduces error
 *   propagation and improves determinism.
 *
 * Input:
 *   { transcript_raw: string, lang_hint?: string }
 *
 * Output:
 *   { transcript_clean: string, lang: string, sentences?: string[] }
 *
 * Notes:
 *   - Keep this agent idempotent and side-effect free.
 *   - If you add translation, return a pointer map for span alignment.
 */

import { normalizeWhitespace, removeFillers, simpleSentenceSplit } from "../utils/text";

export interface PreprocessingInput {
  transcript_raw: string;
  lang_hint?: string;
}

export interface PreprocessingOutput {
  transcript_clean: string;
  lang: string;           // ISO-639-1 when possible, or "auto"
  sentences?: string[];   // optional but handy for IE agent
  // pointerMap?: Array<[srcStart, srcEnd, dstStart, dstEnd]>; // if translation is added later
}

/** Naive language detector placeholder. Replace with a proper detector when available. */
function detectLanguageNaive(text: string, hint?: string): string {
  if (hint) return hint.toLowerCase();
  // Extremely naive heuristics just for bootstrapping:
  const deHits = (text.match(/\b(und|ich|nicht|danke|bitte|gern|termin)\b/gi) || []).length;
  const itHits = (text.match(/\b(ecco|ciao|grazie|prego|appuntamento)\b/gi) || []).length;
  const enHits = (text.match(/\b(and|the|please|thanks|meeting)\b/gi) || []).length;

  const max = Math.max(deHits, itHits, enHits);
  if (max === 0) return "auto";
  if (max === deHits) return "de";
  if (max === itHits) return "it";
  return "en";
}

/**
 * Main preprocessing function. Pure and easily testable.
 */
export async function preprocessingAgent(input: PreprocessingInput): Promise<PreprocessingOutput> {
  const raw = (input.transcript_raw || "").toString();

  // 1) Basic normalization
  const normalized = normalizeWhitespace(raw);

  // 2) Remove low-signal fillers
  const deflated = removeFillers(normalized);

  // 3) Sentence segmentation (optional but useful downstream)
  const sentences = simpleSentenceSplit(deflated);

  // 4) Language detection (very simple now; swap with a better detector later)
  const lang = detectLanguageNaive(deflated, input.lang_hint);

  // 5) Compose cleaned transcript (from sentences to avoid double spaces)
  const transcript_clean = sentences.length ? sentences.join(" ") : deflated;

  return { transcript_clean, lang, sentences };
}
