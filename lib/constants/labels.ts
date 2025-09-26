/**
 * Central whitelist for the 8 allowed UBS labels.
 * Import this wherever you need to validate predicted labels.
 */
export const LABEL_WHITELIST = [
  "plan_contact",
  "schedule_meeting",
  "update_contact_info_non_postal",
  "update_contact_info_postal_address",
  "update_kyc_activity",
  "update_kyc_origin_of_assets",
  "update_kyc_purpose_of_businessrelation",
  "update_kyc_total_assets",
] as const;

export type AllowedLabel = typeof LABEL_WHITELIST[number];

export const LABEL_SET = new Set<string>(LABEL_WHITELIST);
