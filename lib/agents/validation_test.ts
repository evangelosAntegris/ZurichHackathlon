#!/usr/bin/env -S node --loader tsx
/**
 * Smoke runner for the Validation Agent (Agent 4).
 * - Reads a transcript from --file (optional). If not provided, uses a built-in sample.
 * - Reads candidates (Classifier output) from --candidates JSON (optional).
 *   If not provided, derives FAKE candidates from label-specific keywords (for quick testing).
 *
 * Usage:
 *   npx tsx scripts/smoke-validation.ts
 *   npx tsx scripts/smoke-validation.ts --file examples/de_sample.txt
 *   npx tsx scripts/smoke-validation.ts --file examples/de_sample.txt --candidates examples/candidates.json
 */

import fs from "fs/promises";
import path from "path";
import { validationAgent } from "./validation";
import { KEYWORDS } from "../utils/validation";
import type { CandidateLabel, EvidenceSpan } from "../types";

type ArgMap = Record<string, string | boolean>;

function parseArgs(argv: string[]): ArgMap {
  const args: ArgMap = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

async function readFileIfExists(p?: string): Promise<string | null> {
  if (!p) return null;
  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  try {
    return await fs.readFile(abs, "utf8");
  } catch {
    return null;
  }
}

/** Build fake candidates using the validator's keyword hints (for quick demos). */
function deriveFakeCandidates(transcript: string): CandidateLabel[] {
  const out: CandidateLabel[] = [];
  for (const [label, re] of Object.entries(KEYWORDS)) {
    const m = re.exec(transcript);
    if (!m || m.index == null) continue;
    const hit = m[0];
    const start = m.index;
    const span: EvidenceSpan = { start, end: start + hit.length, text: hit };
    out.push({
      label: label as CandidateLabel["label"],
      score: 0.48,               // neutral mid score to exercise adjustments
      why: "keyword match",
      spans: [span],
    });
  }
  return out;
}

// Built-in sample transcript (DE/EN mixed) – entirely synthetic.
const SAMPLE_TRANSCRIPT = `
Guten Morgen, Frau NAME. Wir können einen Rückruf zur Terminvereinbarung machen (schedule a meeting next week).
Ihre neue Adresse wurde im System aktualisiert. Link: https://example.com/doc/9512
Zur Herkunft des Vermögens: Eine Erbschaft wurde erwähnt (origin of assets).
Bitte aktualisieren Sie auch die E-Mail.
`;

async function main() {
  const args = parseArgs(process.argv);
  const transcript = (await readFileIfExists(args.file as string))?.toString() || SAMPLE_TRANSCRIPT;

  let candidates: CandidateLabel[] = [];
  const candJson = await readFileIfExists(args.candidates as string);
  if (candJson) {
    try {
      const parsed = JSON.parse(candJson);
      if (Array.isArray(parsed)) {
        candidates = parsed as CandidateLabel[];
      } else if (Array.isArray(parsed?.candidates)) {
        candidates = parsed.candidates as CandidateLabel[];
      } else {
        throw new Error("Invalid candidates JSON structure.");
      }
    } catch (e) {
      console.warn(`[warn] Failed to parse --candidates JSON: ${(e as Error).message}`);
    }
  }

  if (candidates.length === 0) {
    console.log("[info] No candidates provided. Deriving FAKE candidates from keywords for demo...");
    candidates = deriveFakeCandidates(transcript);
  }

  const { validated } = await validationAgent({
    candidates,
    transcript_clean: transcript,
  });

  const result = {
    input: {
      transcript_preview: transcript.slice(0, 220) + (transcript.length > 220 ? "…" : ""),
      candidates_count: candidates.length,
    },
    output: {
      validated_count: validated.length,
      validated,
    },
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("[error] Validation smoke run failed:", err);
  process.exit(1);
});
