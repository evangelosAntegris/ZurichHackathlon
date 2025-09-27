import type { CleanOut, PipelineConfig, RoutedOut } from "@/lib/types/pipeline"
import { detectLanguage, maybeTranslateToEnglish } from "@/lib/utils/lang"

export async function languageRouter(cleanOut: CleanOut, cfg: PipelineConfig): Promise<RoutedOut> {
  const lang = detectLanguage(cleanOut.cleanText)
  const translation = maybeTranslateToEnglish(
    cleanOut.cleanText,
    lang,
    cfg.router.translateIfNonEn,
  )

  return {
    sampleId: cleanOut.sampleId,
    textForModel: translation.text,
    sourceLang: translation.lang,
    translated: translation.translated,
    translatorProvider: translation.translator,
    routingHint: translation.routingHint,
  }
}
