/**
 * LLM call abstraction using OpenAI's Node SDK.
 * - Loads .env from project root (same level as /lib).
 * - Reads OPENAI_API_KEY and optional OPENAI_MODEL.
 * - Forces JSON-only outputs (response_format: json_object).
 *
 * Docs:
 *  - JSON mode / structured outputs: platform.openai.com/docs/guides/structured-outputs
 *  - Chat Completions (legacy) vs Responses (new): platform.openai.com/docs/guides/migrate-to-responses
 *  - JS library & env keys: platform.openai.com/docs/libraries/javascript
 */

import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import OpenAI from "openai";

export interface LLMOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/** Singleton client to avoid re-creating across calls. */
function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY in .env (project root). Please set it and restart the app."
    );
  }
  // OpenAI SDK caches internals; creating per-call is fine, but we keep a single instance.
  return new OpenAI({ apiKey });
}

const client = getClient();

/**
 * Call the LLM with a prompt and optional input object.
 * Returns STRICT JSON text (we enforce JSON mode in the request).
 */
export async function llmCall(
  prompt: string,
  input: Record<string, any>,
  opts: LLMOptions = {}
): Promise<string> {
  const model = opts.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const temperature = opts.temperature ?? 0.2;
  const max_tokens = opts.max_tokens ?? 400;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are an extraction model. Always return STRICT JSON. No markdown, no prose.",
    },
    {
      role: "user",
      content: `${prompt}\n\nINPUT (JSON):\n${JSON.stringify(input)}`,
    },
  ];

  const res = await client.chat.completions.create({
    model,
    temperature,
    max_tokens,
    messages,
    // Enforce JSON output shape
    response_format: { type: "json_object" },
  });

  const content = res.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from OpenAI Chat Completions.");
  }
  return content;
}