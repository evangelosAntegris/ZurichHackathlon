import type { EvidenceItem, Label } from "@/lib/types/pipeline"

const TRIGGER_PHRASES: Record<Label, RegExp[]> = {
  plan_contact: [/\b(contact|reach out|follow up)\b/i],
  schedule_meeting: [/\b(meeting|appointment|call)\b/i],
  update_contact_info_non_postal: [/\b(email|phone|telephone|number)\b/i],
  update_contact_info_postal_address: [/\b(address|via|strasse|street)\b/i],
  update_kyc_activity: [/\b(job|occupation|profession|attività)\b/i],
  update_kyc_origin_of_assets: [/\b(origin of assets|source of funds|inheritance|eredità)\b/i],
  update_kyc_purpose_of_businessrelation: [/\b(purpose of (the )?relationship|motivo della relazione)\b/i],
  update_kyc_total_assets: [/\b(total assets|net worth|patrimonio|vermögen)\b/i],
}

const ANTI_TRIGGERS: Record<Label, RegExp[]> = {
  plan_contact: [],
  schedule_meeting: [],
  update_contact_info_non_postal: [/\bverify|confirm\b/i],
  update_contact_info_postal_address: [/\bverify|confirm\b/i],
  update_kyc_activity: [],
  update_kyc_origin_of_assets: [],
  update_kyc_purpose_of_businessrelation: [],
  update_kyc_total_assets: [],
}

export interface TriggerMatch {
  label: Label
  score: number
  hint: string
  quote?: string
  span?: { start: number; end: number }
}

export function evaluateTriggers(text: string): TriggerMatch[] {
  const matches: TriggerMatch[] = []
  const lower = text.toLowerCase()

  for (const label of Object.keys(TRIGGER_PHRASES) as Label[]) {
    const triggers = TRIGGER_PHRASES[label]
    const anti = ANTI_TRIGGERS[label] || []
    let bestQuote: string | undefined
    let bestSpan: { start: number; end: number } | undefined
    let score = 0

    for (const regex of triggers) {
      const m = regex.exec(text)
      if (!m) continue
      const start = m.index
      const end = m.index + m[0].length
      const snippet = text.slice(Math.max(0, start - 40), Math.min(text.length, end + 40)).trim()
      if (score === 0) {
        bestQuote = snippet
        bestSpan = { start, end }
      }
      score = Math.max(score, 0.7)
    }

    if (score === 0) continue

    const antiHit = anti.some((regex) => regex.test(lower))
    if (antiHit) {
      score -= 0.2
    }

    matches.push({
      label,
      score: Number(score.toFixed(2)),
      hint: antiHit ? "trigger_with_anti" : "trigger",
      quote: bestQuote,
      span: bestSpan,
    })
  }

  return matches
}

export function buildEvidenceFromTriggers(matches: TriggerMatch[]): Record<Label, EvidenceItem[]> {
  const out: Record<Label, EvidenceItem[]> = {
    plan_contact: [],
    schedule_meeting: [],
    update_contact_info_non_postal: [],
    update_contact_info_postal_address: [],
    update_kyc_activity: [],
    update_kyc_origin_of_assets: [],
    update_kyc_purpose_of_businessrelation: [],
    update_kyc_total_assets: [],
  }

  for (const m of matches) {
    if (!m.quote && !m.span) continue
    const item: EvidenceItem = { label: m.label, quote: m.quote, hint: m.hint }
    if (m.span) item.span = m.span
    out[m.label].push(item)
  }
  return out
}
