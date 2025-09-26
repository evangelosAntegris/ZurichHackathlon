/**
 * Per-label thresholds calibrated on the dev split (placeholder values).
 * The Orchestrator will import these and can overwrite them at runtime.
 */
import type { Label } from "../types";

export const DEFAULT_THRESHOLDS: Record<Label, number> = {
  schedule_meeting: 0.45,
  update_contact_info_non_postal: 0.45,
  update_contact_info_postal_address: 0.45,
  update_kyc_origin_of_assets: 0.40,
  update_kyc_activity: 0.45,
  update_kyc_purpose_of_businessrelation: 0.45,
  update_kyc_total_assets: 0.45,
  plan_contact: 0.45,
};
