/**
 * IE Agent smoke test on a specific dataset file.
 * File: data/train/8WytiD5vQTmjWK9nrd6Aor.txt
 *
 * Run:
 *   npx tsx lib/agents/ie_test.ts
 *
 * Requirements:
 *   - .env at project root with OPENAI_API_KEY (and optional OPENAI_MODEL)
 *   - The IE agent wired to OpenAI via /lib/llm/index.ts
 */

import { promises as fs } from "fs";
import path from "path";
import { intentEntityAgent } from "./ie";

function stripDisclaimer(text: string): string {
  // Remove the synthetic data disclaimer block if present (up to first blank line)
  return text.replace(/^DISCLAIMER:[\s\S]*?\n\s*\n/i, "").trim();
}

async function main() {
  // Build absolute path to the target transcript
  const targetPath = path.join(process.cwd(), "data", "train", "8WytiD5vQTmjWK9nrd6Aor.txt");

  // Read and pre-trim transcript
  const raw = await fs.readFile(targetPath, "utf-8");
  const transcript = stripDisclaimer(raw);

  // Call IE Agent (will use OpenAI if llmCall is wired)
  const out = await intentEntityAgent({ transcript_clean: transcript });

  // Pretty-print a compact result for manual inspection
  console.log(
    JSON.stringify(
      {
        file: targetPath,
        requests: out.requests,
        entities: out.entities,
        evidence_spans: out.evidence_spans,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
