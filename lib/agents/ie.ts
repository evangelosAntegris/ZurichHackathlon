/**
 * Intent & Entity Extractor Agent
 * -------------------------------
 * Goal:
 *   Convert a cleaned transcript into (1) atomic client requests and (2) structured entities,
 *   with evidence spans for UI highlighting and Validation.
 *
 * Strategy:
 *   - Hybrid: rule-based entities + LLM for atomic requests (with JSON output).
 *   - Fallback: if LLM JSON parsing fails, derive naive requests from heuristics.
 */

import { IEOutput, EvidenceSpan } from "../types";
import { llmCall } from "../llm";
import { extractEntitiesRuleBased } from "../utils/entities";
import { findSpan } from "../utils/spans";

export interface IEInput {
  transcript_clean: string;
  sentences?: string[]; // optional, from preprocessing
}

const REQUESTS_JSON_SCHEMA_NOTE = `
Return strict JSON with:
{
  "requests": ["short imperative actions ..."],
  "notes": "optional, one line max"
}
No markdown, no prose, JSON only.
`;

const IE_PROMPT = (transcript: string) => `
You are an assistant that extracts atomic client requests from a financial advisor conversation.
Rules:
- Return short, imperative requests, one action each (e.g., "schedule a meeting next week", "update email address").
- Do NOT infer beyond the text; no hallucinations.
- Keep each request under 15 words.
- Deduplicate similar requests.
- Language can be DE/EN/IT; keep requests in the transcript language.

${REQUESTS_JSON_SCHEMA_NOTE}

Transcript:
"""
${transcript}
"""
`;

/** Naive fallback for requests if the LLM isn't available or returns invalid JSON. */
function fallbackRequests(sentences: string[] | undefined, text: string): string[] {
  const src = (sentences && sentences.length ? sentences : text.split(/[.!?]\s+/)).map(s => s.trim());
  // Very light heuristics: keep sentences that contain a verb suggesting an action
  const actionHints = /\b(schedule|meeting|update|change|address|email|kyc|origin|call|contact|appointment|termin|adresse|erbschaft|inheritance|finden|vereinbaren)\b/i;
  const candidates = src.filter(s => actionHints.test(s));
  // Normalize to short imperative-like lines
  return candidates.map(s => s.replace(/^I'?d like to\b|^Ich möchte\b|^Vorrei\b/i, "").trim())
                   .map(s => s.replace(/\s+/g, " "))
                   .map(s => s.toLowerCase())
                   .map(s => s.replace(/^\-+\s*/, ""))
                   .slice(0, 10);
}

function ensureUniqueShort(list: string[], maxLen = 120): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const v = item.trim().slice(0, maxLen);
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function buildRequestSpans(transcript: string, requests: string[]): EvidenceSpan[] {
  const spans: EvidenceSpan[] = [];
  for (const r of requests) {
    const s = findSpan(transcript, r);
    if (s) spans.push({ ...s, text: transcript.slice(s.start, s.end) });
  }
  return spans;
}

export async function intentEntityAgent(input: IEInput): Promise<IEOutput> {
  const transcript = (input.transcript_clean || "").toString();

  // 1) Entities (rule-based, deterministic)
  const { entities, spans: entitySpans } = extractEntitiesRuleBased(transcript);

  // 2) Requests (LLM, JSON)
  let requests: string[] = [];
  let reqSpans: EvidenceSpan[] = [];

  try {
    const raw = await llmCall(IE_PROMPT(transcript), {}, { temperature: 0.2, max_tokens: 400 });
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.requests)) throw new Error("Missing requests[]");
    requests = ensureUniqueShort(parsed.requests);
  } catch {
    // Fallback to naive heuristic extraction
    requests = ensureUniqueShort(fallbackRequests(input.sentences, transcript));
  }

  // 3) Spans for requests (best-effort)
  reqSpans = buildRequestSpans(transcript, requests);

  // 4) Merge evidence spans (entities + requests)
  const evidence_spans = [
    ...entitySpans,
    ...reqSpans,
  ];

  return {
    requests,
    entities,
    evidence_spans,
  };
}
