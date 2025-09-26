#!/usr/bin/env -S node --loader tsx
/**
 * test-pipeline-eval.ts
 * ------------------------------------------------------------
 * Run the full multi-agent pipeline on a single UBS transcript (.txt),
 * read the ground-truth (.json) with the same basename,
 * and compute the official score (FN=2, FP=1).
 *
 * Usage:
 *   npx tsx scripts/test-pipeline-eval.ts \
 *     --file From-Talk-to-Task-Insights-from-Client-Conversations/data/ubs_synthetic_call_transcripts_dataset/test/22wAtYTBxR5US7ti2XUpk4.txt \
 *     --prompt prompts/classifier.txt \
 *     --dump
 *
 * Options:
 *   --file    Path to transcript .txt (required)
 *   --json    (optional) explicit path to ground-truth .json (defaults to <file>.json)
 *   --prompt  Path to classifier TXT prompt (defaults to prompts/classifier.txt)
 *   --dump    Print intermediate pipeline data (requests, candidates, validated, labels_meta)
 */

import fs from "fs/promises";
import path from "path";

// ⚠️ UPDATE THIS IMPORT PATH if your orchestrator `run(...)` lives elsewhere.
import { run } from "./orchestrator";

// Allowed UBS labels (exact ids & order must match the official evaluator)
const ALLOWED_LABELS = [
  "plan_contact",
  "schedule_meeting",
  "update_contact_info_non_postal",
  "update_contact_info_postal_address",
  "update_kyc_activity",
  "update_kyc_origin_of_assets",
  "update_kyc_purpose_of_businessrelation",
  "update_kyc_total_assets",
] as const;

type Args = Record<string, string | boolean>;
function parseArgs(argv: string[]): Args {
  const a: Args = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith("--")) {
      const key = k.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      a[key] = val;
    }
  }
  return a;
}

async function readIf(p?: string | boolean): Promise<string | null> {
  if (!p || typeof p !== "string") return null;
  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  try { return await fs.readFile(abs, "utf8"); } catch { return null; }
}

/**
 * Extract true labels from UBS JSON (supports shapes):
 * - Array<{ task_type: string, ... }>
 * - Array<string>
 * - { labels: string[] }
 */
function extractTrueLabels(jsonText: string): string[] {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data)) {
      if (data.length && typeof data[0] === "object") {
        return data
          .map((o: any) => o?.task_type)
          .filter((l: any) => typeof l === "string" && (ALLOWED_LABELS as readonly string[]).includes(l));
      }
      if (data.length && typeof data[0] === "string") {
        return data.filter((l: any) => (ALLOWED_LABELS as readonly string[]).includes(l));
      }
    }
    if (Array.isArray((data as any)?.labels)) {
      return (data as any).labels.filter((l: string) => (ALLOWED_LABELS as readonly string[]).includes(l));
    }
  } catch { /* ignore parse errors */ }
  return [];
}

/**
 * OFFICIAL evaluation (1:1 port from the Python function in the repo).
 * Accepts batches (lists of lists) and returns the macro-average score.
 */
function evaluatePredictionsOfficial(
  y_true: string[][],
  y_pred: string[][]
): number {
  const LABEL_TO_IDX = new Map((ALLOWED_LABELS as readonly string[]).map((l, i) => [l, i]));
  const FN_PENALTY = 2.0;
  const FP_PENALTY = 1.0;

  function processSampleLabels(sample: any, name: string): string[] {
    if (!Array.isArray(sample)) {
      throw new Error(`${name} must be a list of strings, got ${typeof sample}`);
    }
    // dedupe + type check
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const label of sample) {
      if (typeof label !== "string") {
        throw new Error(`${name} contains non-string label: ${label} (type: ${typeof label})`);
      }
      if (seen.has(label)) {
        throw new Error(`${name} contains duplicate label: '${label}'`);
      }
      seen.add(label);
      unique.push(label);
    }
    // validity check
    for (const label of unique) {
      if (!LABEL_TO_IDX.has(label)) {
        throw new Error(`${name} contains invalid label: '${label}'. Allowed labels: ${ALLOWED_LABELS.join(", ")}`);
      }
    }
    return unique;
  }

  if (y_true.length !== y_pred.length) {
    throw new Error(`y_true and y_pred must have same length. Got ${y_true.length} vs ${y_pred.length}`);
  }

  const n_samples = y_true.length;
  const n_labels = ALLOWED_LABELS.length;

  // Binary matrices
  const yTrueBin = Array.from({ length: n_samples }, () => Array(n_labels).fill(0));
  const yPredBin = Array.from({ length: n_samples }, () => Array(n_labels).fill(0));

  for (let i = 0; i < n_samples; i++) {
    const trueLabels = processSampleLabels(y_true[i], `y_true[${i}]`);
    for (const lab of trueLabels) {
      const idx = LABEL_TO_IDX.get(lab)!;
      yTrueBin[i][idx] = 1;
    }
  }

  for (let i = 0; i < n_samples; i++) {
    const predLabels = processSampleLabels(y_pred[i], `y_pred[${i}]`);
    for (const lab of predLabels) {
      const idx = LABEL_TO_IDX.get(lab)!;
      yPredBin[i][idx] = 1;
    }
  }

  // Per-sample scoring
  const perSampleScores: number[] = [];
  for (let i = 0; i < n_samples; i++) {
    let fn = 0, fp = 0, trueCount = 0;
    for (let j = 0; j < n_labels; j++) {
      const t = yTrueBin[i][j] === 1;
      const p = yPredBin[i][j] === 1;
      if (t) trueCount++;
      if (t && !p) fn++;
      if (!t && p) fp++;
    }
    const maxErr = FN_PENALTY * trueCount + FP_PENALTY * (n_labels - trueCount);
    const weighted = FN_PENALTY * fn + FP_PENALTY * fp;
    const score = maxErr > 0 ? 1.0 - (weighted / maxErr) : 1.0;
    perSampleScores.push(score);
  }

  const avg = perSampleScores.reduce((a, b) => a + b, 0) / perSampleScores.length;
  return Math.max(0, Math.min(1, avg));
}

/** Helper to compute a readable breakdown for a single sample (TP/FN/FP). */
function singleSampleBreakdown(yTrue: string[], yPred: string[]) {
  const trueSet = new Set(yTrue);
  const predSet = new Set(yPred);
  let tp = 0, fn = 0, fp = 0;
  for (const l of ALLOWED_LABELS) {
    const t = trueSet.has(l);
    const p = predSet.has(l);
    if (t && p) tp++;
    else if (t && !p) fn++;
    else if (!t && p) fp++;
  }
  return {
    tp, fn, fp,
    missed: yTrue.filter(l => !predSet.has(l)),
    extra: yPred.filter(l => !trueSet.has(l)),
  };
}

(async () => {
  const a = parseArgs(process.argv);

  const fileTxt = a.file as string;
  if (!fileTxt) {
    console.error("[error] --file <path-to-.txt> is required");
    process.exit(1);
  }
  const promptPath = (a.prompt as string) || "lib/prompts/classifier.txt";
  const fileJson = (a.json as string) || fileTxt.replace(/\.txt$/i, ".json");
  const dump = !!a.dump;

  // Read files
  const txt = await readIf(fileTxt);
  if (!txt) {
    console.error("[error] cannot read .txt:", fileTxt);
    process.exit(1);
  }
  const gtText = await readIf(fileJson);

  // Run full pipeline (Agents 1→5)
  const { prep, ie, clf, val, fin } = await run(txt, promptPath);

  // Prepare predictions & ground-truth
  const yPred = fin.labels_final;
  const yTrue = gtText ? extractTrueLabels(gtText) : [];

  // Evaluate with the official function (batch of 1)
  let score: number | null = null;
  if (yTrue.length) {
    score = Number(evaluatePredictionsOfficial([yTrue], [yPred]).toFixed(3));
  }

  // Assemble output
  const result: any = {
    input: {
      file_txt: fileTxt,
      file_json: gtText ? fileJson : "(missing)",
      prompt: promptPath,
      transcript_preview: prep.transcript_clean.slice(0, 220) + (prep.transcript_clean.length > 220 ? "…" : ""),
    },
    y_true: yTrue,
    y_pred: yPred,
    evaluation: yTrue.length
      ? { score, ...singleSampleBreakdown(yTrue, yPred) }
      : "No ground-truth JSON found; pass --json if needed.",
  };

  if (dump) {
    result.intermediate = {
      requests: ie.requests,
      candidates: clf.candidates,
      validated: val.validated,
      labels_meta: fin.labels_meta,
    };
  }

console.log(JSON.stringify(result, null, 2));
  // --- Pretty print: Predicted labels (final) ---
console.log("\n==============================");
console.log("Predicted labels (final):");
if (yPred.length === 0) {
  console.log("∅ none");
} else {
  for (const lab of yPred) console.log("•", lab);
}
console.log("==============================\n");

})().catch(err => {
  console.error("[error] test-pipeline-eval failed:", err);
  process.exit(1);
});
