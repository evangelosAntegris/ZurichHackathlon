/**
 * Orchestrator Finalization (Agent 5)
 * -----------------------------------
 * Goal:
 *   Apply per-label thresholds (tuned on dev), optional span requirements,
 *   deduplicate, sort, and (optionally) cap to top-K.
 *
 * Input:
 *   - validated: output from Validation Agent (Agent 4)
 *   - thresholds: optional per-label thresholds (defaults loaded from config)
 *   - topK: max number of labels to return (Infinity by default)
 *   - minSpans: minimum number of evidence spans required per label (0 by default)
 *
 * Output:
 *   - labels_final: string[] of label ids (deduplicated, thresholded)
 *   - labels_meta: rich meta for UI/debug (score_final, rationale, spans, threshold)
 */

import type { Label, ValidatedLabel, EvidenceSpan } from "../types";
import { DEFAULT_THRESHOLDS } from "../config/thresholds";

export interface FinalizeInput {
  validated: ValidatedLabel[];
  thresholds?: Partial<Record<Label, number>>;
  sort?: boolean;     // if true, sort by score desc (default true)
  topK?: number;      // NEW: cap results to top-K (default Infinity)
  minSpans?: number;  // NEW: require at least N evidence spans (default 0)
}

export interface LabelMeta {
  label: Label;
  score_final: number;
  threshold: number;
  spans: EvidenceSpan[];
  rationale?: string;
}

export interface FinalizeOutput {
  labels_final: Label[];
  labels_meta: LabelMeta[];
}

/** Merge runtime thresholds over defaults. */
function mergeThresholds(
  base: Record<Label, number>,
  override?: Partial<Record<Label, number>>
): Record<Label, number> {
  const merged = { ...base };
  if (override) {
    for (const k of Object.keys(override) as Label[]) {
      const v = override[k];
      if (typeof v === "number" && !Number.isNaN(v)) merged[k] = v;
    }
  }
  return merged;
}

/**
 * Optional: allow thresholds override via env var FINALIZE_THRESHOLDS_JSON
 * Example:
 *   export FINALIZE_THRESHOLDS_JSON='{"schedule_meeting":0.44,"update_kyc_origin_of_assets":0.38}'
 */
export function loadThresholdsFromEnv(): Partial<Record<Label, number>> | undefined {
  const raw = process?.env?.FINALIZE_THRESHOLDS_JSON;
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return parsed as Partial<Record<Label, number>>;
  } catch {
    return undefined;
  }
}

/** Safe numeric env reader */
function numEnv(name: string, fallback: number): number {
  const raw = process?.env?.[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function finalizeAgent(input: FinalizeInput): FinalizeOutput {
  const thresholds = mergeThresholds(
    DEFAULT_THRESHOLDS,
    input.thresholds ?? loadThresholdsFromEnv()
  );

  // NEW: read optional controls (env fallback)
  const sort = input.sort !== false;
  const topK = Number.isFinite(input.topK as number) ? (input.topK as number) : numEnv("FINALIZE_TOPK", Infinity);
  const minSpans = Number.isFinite(input.minSpans as number) ? (input.minSpans as number) : numEnv("FINALIZE_MIN_SPANS", 0);

  // 1) Filter by per-label threshold + min evidence spans (if requested)
  const passing: LabelMeta[] = [];
  for (const v of input.validated || []) {
    const t = thresholds[v.label as Label] ?? 0.5;
    const score = v.score_adj ?? 0;
    const spans = v.spans || [];
    const spansOK = spans.length >= minSpans;

    if (score >= t && spansOK) {
      passing.push({
        label: v.label as Label,
        score_final: score,
        threshold: t,
        spans,
        rationale: v.rationale,
      });
    }
  }

  // 2) Deduplicate labels (keep the best score)
  const bestByLabel = new Map<Label, LabelMeta>();
  for (const m of passing) {
    const prev = bestByLabel.get(m.label);
    if (!prev || m.score_final > prev.score_final) bestByLabel.set(m.label, m);
  }

  // 3) Optional sorting
  let labels_meta = Array.from(bestByLabel.values());
  if (sort) {
    labels_meta.sort((a, b) => (b.score_final - a.score_final) || a.label.localeCompare(b.label));
  }

  // 4) Optional cap to top-K
  if (Number.isFinite(topK)) {
    labels_meta = labels_meta.slice(0, topK as number);
  }

  // 5) Final id list
  const labels_final = labels_meta.map(m => m.label);

  return { labels_final, labels_meta };
}
