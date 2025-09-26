/**
 * Loads a raw TXT prompt from disk (once) and returns it as string.
 * You can keep your carefully tuned instructions untouched.
 */
import fs from "fs/promises";
import path from "path";

const cache = new Map<string, string>();

export async function loadTxtPrompt(promptPath: string): Promise<string> {
  const abs = path.isAbsolute(promptPath) ? promptPath : path.join(process.cwd(), promptPath);
  if (cache.has(abs)) return cache.get(abs)!;
  const data = await fs.readFile(abs, "utf8");
  cache.set(abs, data);
  return data;
}
