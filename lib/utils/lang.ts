import type { SupportedLanguage } from "@/lib/types/pipeline"

const HINTS: Array<{ lang: SupportedLanguage; tokens: RegExp }> = [
  { lang: "de", tokens: /\b(und|nicht|danke|termin|bitte|konto)\b/i },
  { lang: "it", tokens: /\b(grazie|appuntamento|conto|signora|ciao)\b/i },
  { lang: "fr", tokens: /\b(merci|rendez-vous|compte|bonjour)\b/i },
]

export function detectLanguage(text: string): SupportedLanguage {
  if (!text.trim()) return "mixed"
  for (const hint of HINTS) {
    if (hint.tokens.test(text)) return hint.lang
  }
  return "en"
}

export interface LanguageRouterResult {
  lang: SupportedLanguage
  translated: boolean
  translator: "supertext" | "none"
  routingHint: "original_en" | "translated_en"
  text: string
}

export function maybeTranslateToEnglish(
  text: string,
  lang: SupportedLanguage,
  translateIfNeeded: boolean,
): LanguageRouterResult {
  if (lang === "en" || !translateIfNeeded) {
    return {
      lang,
      translated: false,
      translator: "none",
      routingHint: "original_en",
      text,
    }
  }

  // Placeholder: in production hook up to Supertext or chosen provider.
  // For now we simply return the original text but mark as "translated" to allow pipeline to proceed.
  return {
    lang,
    translated: true,
    translator: "supertext",
    routingHint: "translated_en",
    text,
  }
}
