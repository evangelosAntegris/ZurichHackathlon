/**
 * Rule-based entity extraction utilities.
 * Keep these fast and deterministic; we can refine patterns over time.
 */

import { EvidenceSpan, Entities } from "../types";

export interface EntityExtraction {
  entities: Entities;
  spans: EvidenceSpan[]; // evidence locations for entities
}

// Simple, language-agnostic patterns (tune later)
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const URL_RE   = /\bhttps?:\/\/[^\s)]+/gi;
// Very permissive "postal-like" pattern (street/number/ZIP); refine later
const ADDRESS_RE = /\b([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ]+(?:\s+[A-ZÀ-ÖØ-Ýa-zà-öø-ÿ]+)*\s+\d+[A-Za-z]?,?\s*(?:CH-)?\d{4,5}\s+[A-ZÀ-ÖØ-Ýa-zà-öø-ÿ]+)\b/g;
// Naive date mentions (weekdays/months/numeric); normalize in a later pass
const DATE_RE = /\b(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Lun|Mar|Mer|Gio|Ven|Sab|Dom)|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Gen|Feb|Mar|Apr|Mag|Giu|Lug|Ago|Set|Ott|Nov|Dic)\.?\s+\d{1,2})\b/gi;
// Amounts (very rough: currency symbol/ISO + number)
const AMOUNT_RE = /\b(?:CHF|EUR|USD|\$|€|Fr)\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\b/g;

function collectMatches(text: string, re: RegExp, captureText = true): EvidenceSpan[] {
  const spans: EvidenceSpan[] = [];
  for (const m of text.matchAll(re)) {
    const start = m.index ?? -1;
    if (start < 0) continue;
    const end = start + m[0].length;
    spans.push({ start, end, text: captureText ? m[0] : undefined });
  }
  return spans;
}

export function extractEntitiesRuleBased(text: string): EntityExtraction {
  const emailSpans  = collectMatches(text, EMAIL_RE);
  const urlSpans    = collectMatches(text, URL_RE);
  const addrSpans   = collectMatches(text, ADDRESS_RE);
  const dateSpans   = collectMatches(text, DATE_RE);
  const amountSpans = collectMatches(text, AMOUNT_RE);

  const entities: Entities = {
    emails: emailSpans.map(s => s.text!).filter(Boolean),
    addresses: addrSpans.map(s => s.text!).filter(Boolean),
    dates: dateSpans.map(s => s.text!).filter(Boolean),
    urls: urlSpans.map(s => s.text!).filter(Boolean),
    amounts: amountSpans.map(s => s.text!).filter(Boolean),
  };

  const spans = [...emailSpans, ...urlSpans, ...addrSpans, ...dateSpans, ...amountSpans];
  return { entities, spans };
}
