/**
 * Agent 3 — Task Classifier (TXT-prompt version)
 * ----------------------------------------------
 * - Loads your tuned TXT prompt from disk
 * - Wraps it to enforce JSON output and provide data
 * - Calls LLM
 * - Normalizes outputs to CandidateLabel[]
 * - If the TXT returns non-JSON, we robustly parse lines/CSV
 * - Adds minimal spans via keyword hints (so Validator ha qualcosa)
 */

import { llmCall } from "../llm";
import { loadTxtPrompt } from "../prompts/loadTxtPrompt";
import { wrapClassifierTxt } from "../prompts/wrapClassifierTxt";
import { LABEL_SET, AllowedLabel } from "../constants/labels";
import type { CandidateLabel, EvidenceSpan, Entities } from "../types";

// Minimal multilingual hints to create spans (same spirit as Validation Agent)
const KEYWORDS: Record<string, RegExp> = {
  schedule_meeting: /\b(meeting|appointment|rückruf|termin|vereinbaren|call back)\b/i,
  plan_contact: /\b(contact|reach out|kontakt|contattare)\b/i,
  update_contact_info_postal_address: /\b(address|adresse|indirizzo|plz|postleitzahl|zip)\b/i,
  update_contact_info_non_postal: /\b(email|e-mail|phone|telefon|nummer|numero)\b/i,
  update_kyc_origin_of_assets: /\b(origin of assets|source of wealth|erbschaft|inheritance|herkunft des vermögens|origine dei beni)\b/i,
  update_kyc_activity: /\b(occupation|employment|job|beschäftigung|beruf|attività)\b/i,
  update_kyc_purpose_of_businessrelation: /\b(purpose of (the )?business( )?relation(ship)?|zweck der geschäftsbeziehung|scopo della relazione)\b/i,
  update_kyc_total_assets: /\b(total assets|net worth|vermögen gesamt|patrimonio totale)\b/i,
};

export interface ClassifierInput {
  transcript_clean: string;
  requests: string[];
  promptPath: string;   // path al vostro TXT
  lang?: string;
  entities?: Entities;
}

export interface ClassifierOutput {
  candidates: CandidateLabel[];
}

function toSpan(transcript: string, label: string): EvidenceSpan[] {
  const re = KEYWORDS[label];
  if (!re) return [];
  const m = transcript.match(re);
  if (!m || m.index == null) return [];
  const start = transcript.toLowerCase().indexOf(m[0].toLowerCase());
  if (start < 0) return [];
  return [{ start, end: start + m[0].length, text: transcript.slice(start, start + m[0].length) }];
}

/** Accept JSON array, {"labels":[...]}, comma/line-separated — normalize to string[] */
function normalizeLabels(raw: string): string[] {
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) return p.map(String);
    if (Array.isArray(p?.labels)) return p.labels.map(String);
  } catch {
    // not JSON → try to parse as comma/line-separated
    const lines = raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    return lines;
  }
  return [];
}

export async function classifierAgent(input: ClassifierInput): Promise<ClassifierOutput> {
  const { transcript_clean, requests, promptPath } = input;

  // 1) Load and wrap your TXT prompt
  const rawTxt = await loadTxtPrompt(promptPath);
  const prompt = wrapClassifierTxt(rawTxt, transcript_clean, requests);

  // 2) Call LLM (JSON enforced by llmCall’s system + our wrapper)
  let labels: string[] = [];
  try {
    const raw = await llmCall(prompt, {}, { temperature: 0, max_tokens: 600 });
    labels = normalizeLabels(raw);
  } catch (e) {
    // If LLM call failed, we can still fallback to a naive mapping from requests:
    labels = [];
  }

  // 3) Whitelist, dedupe
  const uniq = Array.from(new Set(labels))
    .filter((l): l is AllowedLabel => LABEL_SET.has(l));

  // 4) Build CandidateLabel objects (baseline score + minimal spans)
  const candidates: CandidateLabel[] = uniq.map(label => ({
    label,
    score: 0.50,                     // neutral baseline; Validator adjusts
    why: "returned by TXT prompt",
    spans: toSpan(transcript_clean, label),
  }));

  return { candidates };
}
