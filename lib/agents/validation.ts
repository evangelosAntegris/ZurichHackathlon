/**
 * Validation Agent (Verifier / Anti-hallucination)
 * ------------------------------------------------
 * Goal:
 *   Keep labels with textual evidence; optionally allow lenient mode to keep
 *   candidates without direct spans (they’ll be filtered by Finalize thresholds/minSpans).
 *
 * Env toggles:
 *   - VALIDATION_REQUIRE_SPAN=1  -> drop labels with 0 spans (strict). Default: 0 (lenient)
 *   - VALIDATION_ALLOW_TIME_HINTS=0 -> disable time/date hints for schedule_meeting. Default: 1
 */

import { EvidenceSpan, ValidatedLabel, CandidateLabel } from "../types";
import {
  isWhitelistedLabel,
  verifySpan,
  keywordEvidence,
  pickStrongSpans,
  resolveConflicts,
  adjustScore,
  KEYWORDS,
  timeEvidence, // assicurati esista in utils (come mostrato in precedenza)
} from "../utils/validation";

export interface ValidationInput {
  candidates: CandidateLabel[];
  transcript_clean: string;
}
export interface ValidationOutput {
  validated: ValidatedLabel[];
}

function boolEnv(name: string, def = false): boolean {
  const v = (process.env?.[name] || "").toLowerCase().trim();
  if (["1","true","yes","on"].includes(v)) return true;
  if (["0","false","no","off"].includes(v)) return false;
  return def;
}
const REQUIRE_SPAN = boolEnv("VALIDATION_REQUIRE_SPAN", false);
const ALLOW_TIME_HINTS = boolEnv("VALIDATION_ALLOW_TIME_HINTS", true);

type RKind = "keyword" | "time" | "text" | "none";
function conciseRationale(label: string, spans: EvidenceSpan[], why?: string, kind: RKind = "keyword"): string {
  const mode =
    kind === "keyword" ? "keyword match" :
    kind === "time"    ? "time/date hint" :
    kind === "text"    ? "text quote" :
                         "no direct evidence";
  const quote = spans[0]?.text ? `“${truncate(spans[0].text!, 60)}”` : "supported phrase";
  const addWhy = (why && why.trim()) ? ` — ${truncate(why.trim(), 80)}` : "";
  return `${mode}: ${quote}${addWhy}`;
}
function truncate(s: string, n = 80) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export async function validationAgent(input: ValidationInput): Promise<ValidationOutput> {
  const transcript = (input.transcript_clean || "").toString();
  const out: ValidatedLabel[] = [];

  for (const c of input.candidates || []) {
    if (!isWhitelistedLabel(c.label)) continue;

    // Verified spans from candidate
    const verifiedSpans: EvidenceSpan[] = (c.spans || []).filter(s => verifySpan(s, transcript));

    let evidence = verifiedSpans;
    let hadKeyword = false;
    let rkind: RKind = verifiedSpans.length ? "text" : "none";

    // keyword fallback
    if (evidence.length === 0) {
      const kwSpans = keywordEvidence(c.label, transcript);
      if (kwSpans.length) {
        evidence = kwSpans;
        hadKeyword = true;
        rkind = "keyword";
      }
    }
    // time/date hint fallback for scheduling
    if (evidence.length === 0 && ALLOW_TIME_HINTS && c.label === "schedule_meeting") {
      const tSpans = timeEvidence(transcript);
      if (tSpans.length) {
        evidence = tSpans;
        rkind = "time";
      }
    }

    // strict vs lenient
    const strongSpans = pickStrongSpans(evidence, 2);
    if (REQUIRE_SPAN && strongSpans.length === 0) continue;

    const score_adj = adjustScore(c.score ?? 0, strongSpans.length, hadKeyword);
    const rationale = conciseRationale(c.label, strongSpans, c.why, rkind);

    out.push({
      label: c.label,
      score_adj,
      spans: strongSpans,
      rationale,
    });
  }

  const resolved = resolveConflicts(out);
  resolved.sort((a, b) => (b.score_adj - a.score_adj) || a.label.localeCompare(b.label));
  return { validated: resolved };
}
