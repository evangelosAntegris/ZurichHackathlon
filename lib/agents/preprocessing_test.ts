import { promises as fs } from "node:fs";
import path from "node:path";
import { preprocessingAgent } from "./preprocessing";

type TestCaseResult = { name: string; passed: boolean; details?: string };
type SmokeTestResult = {
  total: number; passed: number; failed: number;
  cases: TestCaseResult[]; sampleFileUsed?: string;
};

function assert(cond: any, msg: string) { if (!cond) throw new Error(msg); }

async function readFirstTxtSample(): Promise<{ text: string; file?: string }> {
  const roots = ["data/test", "data/train"];
  for (const rel of roots) {
    const dir = path.join(process.cwd(), rel);
    try {
      const files = await fs.readdir(dir);
      const txt = files.find((f) => f.toLowerCase().endsWith(".txt"));
      if (txt) {
        const fp = path.join(dir, txt);
        const content = await fs.readFile(fp, "utf-8");
        return { text: content, file: path.join(rel, txt) };
      }
    } catch { /* ignore */ }
  }
  return { text: "" };
}

export async function runPreprocessingSmokeTest(): Promise<SmokeTestResult> {
  const cases: TestCaseResult[] = [];

  try {
    const input = "Uhm...  Good   morning! I'd like to schedule a meeting. You know, next week.";
    const out = await preprocessingAgent({ transcript_raw: input });
    assert(out.transcript_clean.length > 0, "Empty cleaned transcript");
    assert((out.sentences?.length || 0) >= 2, "Expected >=2 sentences");
    assert(!/uhm/i.test(out.transcript_clean), "Filler 'uhm' not removed");
    assert(!/you know/i.test(out.transcript_clean), "Filler 'you know' not removed");
    assert(["en","auto"].includes(out.lang), `Unexpected lang: ${out.lang}`);
    cases.push({ name: "A) English with fillers", passed: true });
  } catch (err: any) {
    cases.push({ name: "A) English with fillers", passed: false, details: err?.message || String(err) });
  }

  try {
    const input = "Ich möchte einen Termin nächste Woche vereinbaren. Und meine Adresse ändern, bitte.";
    const out = await preprocessingAgent({ transcript_raw: input });
    assert(out.transcript_clean.includes("Termin"), "Missing 'Termin'");
    assert((out.sentences?.length || 0) >= 2, "Expected >=2 sentences");
    assert(out.lang === "de", `Expected 'de' got '${out.lang}'`);
    cases.push({ name: "B) German detection", passed: true });
  } catch (err: any) {
    cases.push({ name: "B) German detection", passed: false, details: err?.message || String(err) });
  }

  let sampleFileUsed: string | undefined;
  try {
    const sample = await readFirstTxtSample();
    if (sample.text) {
      sampleFileUsed = sample.file;
      const out = await preprocessingAgent({ transcript_raw: sample.text });
      assert(out.transcript_clean.length > 0, "Empty cleaned transcript from sample");
      cases.push({ name: `C) Real file sample (${sample.file})`, passed: true });
    } else {
      cases.push({ name: "C) Real file sample", passed: true, details: "No .txt in data/test or data/train (skipped)" });
    }
  } catch (err: any) {
    cases.push({ name: "C) Real file sample", passed: false, details: err?.message || String(err) });
  }

  const passed = cases.filter(c => c.passed).length;
  const failed = cases.length - passed;
  return { total: cases.length, passed, failed, cases, sampleFileUsed };
}

const invokedDirectly =
  typeof process !== "undefined" &&
  process.argv[1] &&
  /preprocessing[._]test\.ts$/.test(process.argv[1]);

if (invokedDirectly) {
  const verbose = process.argv.includes("--verbose");

  runPreprocessingSmokeTest()
    .then(async (res) => {
      // Stampa il risultato standard
      console.log(JSON.stringify(res, null, 2));

      // Se verbose e abbiamo usato un file reale, mostra un mini diff
      if (verbose && res.sampleFileUsed) {
        const { promises: fs } = await import("node:fs");
        const path = (await import("node:path")).default;
        const fp = path.join(process.cwd(), res.sampleFileUsed);
        const raw = await fs.readFile(fp, "utf-8");

        // Re-invoca l'agente per ottenere l'output
        const { preprocessingAgent } = await import("./preprocessing");
        const out = await preprocessingAgent({ transcript_raw: raw });

        // Piccolo report “prima vs dopo”
        const beforeChars = raw.length;
        const afterChars = out.transcript_clean.length;
        const beforeLines = raw.split(/\n/).length;
        const afterSentences = (out.sentences?.length || 0);

        console.log("\n--- VERBOSE REPORT ---");
        console.log("File:", res.sampleFileUsed);
        console.log("Lang detected:", out.lang);
        console.log(`Chars: ${beforeChars} -> ${afterChars}`);
        console.log(`Lines: ${beforeLines} -> Sentences: ${afterSentences}`);

        // Mostra uno snippet (prime 300 chars) prima/dopo
        const cut = (s: string) => s.slice(0, 300).replace(/\s+/g, " ").trim();
        console.log("\nBefore (snippet):\n", cut(raw));
        console.log("\nAfter  (snippet):\n", cut(out.transcript_clean));
        console.log("\n----------------------\n");
      }

      if (res.failed > 0) process.exitCode = 1;
    })
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    });
}
