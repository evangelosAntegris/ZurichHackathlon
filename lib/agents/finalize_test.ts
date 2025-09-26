#!/usr/bin/env -S node --loader tsx
/**
 * Smoke runner for Agent 5 (Finalization).
 *
 * Usage:
 *   # demo completo (fake candidates → validation → finalize)
 *   npx tsx scripts/smoke-finalize.ts
 *
 *   # con transcript custom
 *   npx tsx scripts/smoke-finalize.ts --file examples/de_sample.txt
 *
 *   # con candidates reali (output Agent 3) -> farà validation e poi finalize
 *   npx tsx scripts/smoke-finalize.ts --file examples/de_sample.txt --candidates examples/candidates.json
 *
 *   # con validated reali (output Agent 4) -> salta validation e fa solo finalize
 *   npx tsx scripts/smoke-finalize.ts --file examples/de_sample.txt --validated examples/validated.json
 *
 *   # thresholds custom
 *   npx tsx scripts/smoke-finalize.ts --thresholds examples/thresholds.json
 *
 * Env override (alternative):
 *   export FINALIZE_THRESHOLDS_JSON='{"schedule_meeting":0.44}'
 */

import fs from "fs/promises";
import path from "path";
import type { CandidateLabel, ValidatedLabel } from "../types";
import { finalizeAgent } from "./finalize";
import { validationAgent } from "./validation";
import { KEYWORDS } from "../utils/validation";

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

async function readIf(p?: string): Promise<string | null> {
  if (!p) return null;
  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  try {
    return await fs.readFile(abs, "utf8");
  } catch {
    return null;
  }
}

function deriveFakeCandidates(transcript: string): CandidateLabel[] {
  const out: CandidateLabel[] = [];
  for (const [label, re] of Object.entries(KEYWORDS)) {
    const m = re.exec(transcript);
    if (!m || m.index == null) continue;
    const hit = m[0];
    out.push({
      label: label as CandidateLabel["label"],
      score: 0.48,
      why: "keyword match",
      spans: [{ start: m.index, end: m.index + hit.length, text: hit }],
    });
  }
  return out;
}

const SAMPLE_TRANSCRIPT = `
Guten Morgen, Frau NAME. Wir können einen Rückruf zur Terminvereinbarung machen (schedule a meeting next week).
Ihre neue Adresse wurde im System aktualisiert. Link: https://example.com/doc/9512
Zur Herkunft des Vermögens: Eine Erbschaft wurde erwähnt (origin of assets).
Bitte aktualisieren Sie auch die E-Mail.
`;

async function main() {
  const args = parseArgs(process.argv);

  const transcript = (await readIf(args.file as string))?.toString() || SAMPLE_TRANSCRIPT;

  // Load thresholds (optional)
  let thresholds: Record<string, number> | undefined;
  const thJson = await readIf(args.thresholds as string);
  if (thJson) {
    try {
      thresholds = JSON.parse(thJson);
    } catch (e) {
      console.warn("[warn] Could not parse --thresholds JSON:", (e as Error).message);
    }
  }

  // If validated provided, use it directly
  let validated: ValidatedLabel[] | undefined;
  const validatedJson = await readIf(args.validated as string);
  if (validatedJson) {
    try {
      const parsed = JSON.parse(validatedJson);
      validated = Array.isArray(parsed) ? (parsed as ValidatedLabel[]) : (parsed.validated as ValidatedLabel[]);
    } catch (e) {
      console.warn("[warn] Could not parse --validated JSON:", (e as Error).message);
    }
  }

  // Else, if candidates provided → run validation first
  if (!validated) {
    let candidates: CandidateLabel[] = [];
    const candJson = await readIf(args.candidates as string);
    if (candJson) {
      try {
        const parsed = JSON.parse(candJson);
        candidates = Array.isArray(parsed) ? parsed as CandidateLabel[] : parsed.candidates as CandidateLabel[];
      } catch (e) {
        console.warn("[warn] Could not parse --candidates JSON:", (e as Error).message);
      }
    }
    if (candidates.length === 0) {
      console.log("[info] No candidates provided. Deriving FAKE candidates from keywords for demo...");
      candidates = deriveFakeCandidates(transcript);
    }
    const valOut = await validationAgent({ candidates, transcript_clean: transcript });
    validated = valOut.validated;
  }

  // Finalize (Agent 5)
  const fin = finalizeAgent({
    validated: validated!,
    thresholds: thresholds as any,
    sort: true,
  });

  console.log(JSON.stringify({
    input: {
      transcript_preview: transcript.slice(0, 220) + (transcript.length > 220 ? "…" : ""),
      validated_count: validated?.length ?? 0,
    },
    output: fin
  }, null, 2));
}

main().catch((err) => {
  console.error("[error] Finalization smoke run failed:", err);
  process.exit(1);
});
