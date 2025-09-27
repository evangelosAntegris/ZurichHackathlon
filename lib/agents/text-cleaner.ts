import { normalizeWhitespace, removeFillers } from "@/lib/utils/text"
import type { CleanOut, SampleIn } from "@/lib/types/pipeline"

export async function textCleaner(sample: SampleIn): Promise<CleanOut> {
  const cleaned = removeFillers(normalizeWhitespace(sample.rawText))
  return {
    sampleId: sample.sampleId,
    cleanText: cleaned,
    stats: {
      charCount: cleaned.length,
    },
  }
}
