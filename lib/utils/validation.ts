/**
 * Validation helpers:
 * - Whitelist enforcement
 * - Span verification against transcript
 * - Label-specific keyword evidence (DE/EN/IT)
 * - Conflict resolution rules
 */

import { EvidenceSpan, ValidatedLabel } from "../types";
import { LABEL_SET } from "../constants/labels";

// Label-specific keyword hints (extend as needed)
export const KEYWORDS: Record<string, RegExp> = {
  schedule_meeting: /\b(meeting|appointment|termin|rückruf|vereinbaren|appuntamento|rendez[- ]vous|prendre\s+rendez[- ]vous|fixer\s+(un\s+)?rendez[- ]vous|rappel)\b/giu,

  plan_contact: /\b(contact|reach\s*out|kontakt|contattare|pianificare\s+contatto|prendre\s+contact|recontacter|rappeler)\b/giu,

  update_contact_info_postal_address: /\b(address|adresse|indirizzo|plz|postleitzahl|adresse\s+postale|code\s+postal|cp\b)\b/giu,

  update_contact_info_non_postal: /\b(email|e-mail|mail|courriel|phone|telefon|tel|téléphone|telephone|nummer|numéro|numero)\b/giu,

  update_kyc_origin_of_assets: /\b(origin\s+of\s+assets|source\s+of\s+wealth|erbschaft|inheritance|herkunft\s+des\s+vermögens|origine\s+dei\s+beni|origine\s+des\s+fonds|source\s+des\s+fonds|provenance\s+des\s+avoirs)\b/giu,

  update_kyc_activity: /\b(activity|occupation|employment|beschäftigung|beruf|attività\s+lavorativa|activité|profession|emploi|travail)\b/giu,

  update_kyc_purpose_of_businessrelation: /\b(purpose\s+of\s+(the\s+)?business\s+relation(ship)?|business\s+purpose|account\s+(will\s+be\s+)?used\s+for|used\s+to\s+pay|to\s+pay\s+bills|salary\s+deposit|direct\s+deposit|invest(ing|ments?)|saving(s)?|recurring\s+transfers?|zweck\s+der\s+geschäftsbeziehung|verwendungszweck|konto\s+(wird\s+)?(für|zum)\s+(lohn|gehalt|rechnungen|investitionen|sparen|daueraufträge)|scopo\s+della\s+relazione|uso\s+del\s+conto|verrà\s+usato\s+per|per\s+pagare\s+le\s+bollette|accredito\s+stipendio|investimenti|risparmio|bonifici\s+ricorrenti|but\s+de\s+la\s+relation\s+d'affaires|objectif\s+de\s+la\s+relation\s+d'affaires|raison\s+de\s+la\s+relation\s+commerciale|usage\s+du\s+compte|sera\s+utilisé\s+pour|pour\s+payer\s+les\s+factures|recevoir\s+le\s+salaire|investir|épargner|epargner|virements?\s+récurrents?)\b/giu,

  update_kyc_total_assets: /\b(total\s+assets|vermögen\s+gesamt|patrimonio\s+totale|actifs\s+totaux|patrimoine\s+total|fortune\s+totale)\b/giu,
};

const DATE_TIME_HINTS = new RegExp(
  String.raw`\b(aujourd'hui|demain|après[- ]demain|la\s+semaine\s+prochaine|semaine\s+prochaine|` +
  String.raw`lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|` +
  String.raw`janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre|` +
  String.raw`today|tomorrow|next\s+week|mon(day)?|tue(sday)?|wed(nesday)?|thu(rsday)?|fri(day)?|sat(urday)?|sun(day)?|` +
  String.raw`januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember|` +
  String.raw`lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|settimana\s+prossima)\b`,
  "giu"
);

export function timeEvidence(transcript: string): EvidenceSpan[] {
  const spans: EvidenceSpan[] = [];
  for (const m of transcript.matchAll(DATE_TIME_HINTS)) {
    const start = m.index ?? -1;
    if (start >= 0) spans.push({ start, end: start + m[0].length, text: m[0] });
  }
  return spans;
}



/** Ensure label is one of the 8 allowed ones. */
export function isWhitelistedLabel(label: string): boolean {
  return LABEL_SET.has(label);
}

/** Check if span indices are valid and (optionally) text matches transcript slice. */
export function verifySpan(span: EvidenceSpan, transcript: string): boolean {
  if (span.start < 0 || span.end <= span.start || span.end > transcript.length) return false;
  if (!span.text) return true;
  const slice = transcript.slice(span.start, span.end);
  return normalize(slice) === normalize(span.text);
}

function normalize(s: string) {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Try to build at least one evidence span using keyword regex for the label. */
export function keywordEvidence(label: string, transcript: string): EvidenceSpan[] {
  const re = KEYWORDS[label];
  if (!re) return [];
  const m = transcript.matchAll(re);
  const spans: EvidenceSpan[] = [];
  for (const hit of m) {
    const start = hit.index ?? -1;
    if (start >= 0) spans.push({ start, end: start + hit[0].length, text: hit[0] });
  }
  return spans;
}

/** Pick strongest spans: prefer longer and earlier (stable for UI highlighting). */
export function pickStrongSpans(spans: EvidenceSpan[], limit = 2): EvidenceSpan[] {
  return spans
    .slice()
    .sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.start - b.start)
    .slice(0, limit);
}

/** Conflict rule: prefer the specific 'schedule_meeting' over generic 'plan_contact'. */
export function resolveConflicts(validated: ValidatedLabel[]): ValidatedLabel[] {
  const hasSchedule = validated.some(v => v.label === "schedule_meeting");
  if (hasSchedule) {
    // Drop plan_contact if schedule_meeting is present with comparable/greater support
    return validated.filter(v => v.label !== "plan_contact");
  }
  return validated;
}

/** Score adjustment heuristics based on evidence quality. */
export function adjustScore(base: number, spanCount: number, hadKeyword: boolean): number {
  let score = base;
  if (spanCount === 0) score -= 0.25;         // no direct evidence → penalize
  else if (spanCount === 1) score -= 0.05;    // minimal evidence
  else score += 0.05;                         // multiple spans → slight boost

  if (hadKeyword) score += 0.05;              // matched label-specific keyword → boost

  // Clamp
  return Math.max(0, Math.min(1, score));
}

