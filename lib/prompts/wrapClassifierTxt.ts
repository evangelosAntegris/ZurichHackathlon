/**
 * Wraps your tested TXT prompt WITHOUT altering its content,
 * adding only:
 *  - the data payload (transcript + requests)
 *  - an explicit JSON output contract the model must follow
 *  - the allowed labels to avoid drift
 */

import { LABEL_WHITELIST } from "../constants/labels";

export function wrapClassifierTxt(rawTxt: string, transcript: string, requests: string[]): string {
  const allowed = LABEL_WHITELIST.map(s => `"${s}"`).join(", ");
  const reqBlock = requests.length
    ? requests.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "(none)";

  return `${rawTxt.trim()}

---
CONTEXT (do not change upstream instructions, this section only provides data):

ALLOWED_LABELS (MUST use exact id, subset allowed):
[${allowed}]

TRANSCRIPT:
"""
${transcript}
"""

ATOMIC_REQUESTS:
${reqBlock}

OUTPUT FORMAT (STRICT):
Return JSON only, no prose:
{"labels": ["<label-id-1>", "<label-id-2>", "..."]}

If no label is supported, return: {"labels": []}
`;
}
