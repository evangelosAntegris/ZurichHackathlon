/**
 * Shared domain types used across agents.
 * Keep these minimal and stable to avoid churn in downstream agents.
 */

export type Label =
  | "plan_contact"
  | "schedule_meeting"
  | "update_contact_info_non_postal"
  | "update_contact_info_postal_address"
  | "update_kyc_activity"
  | "update_kyc_origin_of_assets"
  | "update_kyc_purpose_of_businessrelation"
  | "update_kyc_total_assets";

export interface EvidenceSpan {
  /** Inclusive start offset in the cleaned transcript */
  start: number;
  /** Exclusive end offset in the cleaned transcript */
  end: number;
  /** Optional text snapshot (useful for debugging / UI highlight) */
  text?: string;
}

export interface Entities {
  emails?: string[];
  addresses?: string[];
  dates?: string[];   // ISO or raw mentions; normalize later if needed
  urls?: string[];
  amounts?: string[]; // raw mentions, currency handling later
}

export interface IEOutput {
  requests: string[];
  entities: Entities;
  evidence_spans: EvidenceSpan[];
}

export interface CandidateLabel {
  label: Label;
  score: number; // 0..1
  why?: string;
  spans?: EvidenceSpan[];
}

export interface ValidatedLabel {
  label: Label;
  score_adj: number; // 0..1 after validation adjustments
  rationale?: string;
  spans: EvidenceSpan[]; // at least one strong span
}

export interface ConversationArtifacts {
  id: string;
  title?: string;
  lang: string;
  transcript_raw: string;
  transcript_clean: string;
  requests: string[];
  entities: Entities;
  labels_final: Label[];
  labels_meta: Array<{
    label: Label;
    score_final: number;
    rationale?: string;
    spans: EvidenceSpan[];
  }>;
  summary_md: string;
  created_at?: string;
  agent_versions?: Record<string, string>;
}
