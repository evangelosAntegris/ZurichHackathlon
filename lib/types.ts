export interface Client {
  id: string
  name: string
  email: string
  dateOfBirth: string
  age: number
  maritalStatus: string
  riskProfile: string
  lastContact: string
  aum: string
  additionalInfo: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  clientId: string
  title: string
  date: string
  duration: string
  type: "call" | "meeting" | "email"
  summary?: string
  transcript?: string
  createdAt: string
  updatedAt: string
}

export interface ProfessionalBackground {
  id: string
  clientId: string
  occupation: string
  education: string
  industry: string
  createdAt: string
  updatedAt: string
}

export interface FinancialPreferences {
  id: string
  clientId: string
  investmentStyle: string
  esgPreference: string
  liquidityNeeds: string
  createdAt: string
  updatedAt: string
}

export interface CommunicationPreferences {
  id: string
  clientId: string
  preferredContact: string
  meetingFrequency: string
  reportDetailLevel: string
  createdAt: string
  updatedAt: string
}

export interface RecentInteraction {
  id: string
  clientId: string
  date: string
  description: string
  type: "update" | "call" | "meeting" | "email"
  createdAt: string
}

export interface UpcomingMeeting {
  id: string
  clientId: string
  date: string
  title: string
  type: "meeting" | "analysis" | "review" | "call"
  description?: string
  createdAt: string
}

export interface RecommendedAction {
  id: string
  clientId: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "portfolio" | "tax" | "meeting" | "risk" | "compliance"
  completed: boolean
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface ClientProfile {
  client: Client
  professionalBackground: ProfessionalBackground
  financialPreferences: FinancialPreferences
  communicationPreferences: CommunicationPreferences
  conversations: Conversation[]
  recentInteractions: RecentInteraction[]
  upcomingMeetings: UpcomingMeeting[]
  recommendedActions: RecommendedAction[]
}

export interface EvidenceSpan {
  /** Inclusive start offset in the cleaned transcript */
  start: number
  /** Exclusive end offset in the cleaned transcript */
  end: number
  /** Optional text snapshot (useful for debugging / UI highlight) */
  text?: string
}

export interface Entities {
  emails?: string[]
  addresses?: string[]
  dates?: string[] // ISO or raw mentions; normalize later if needed
  urls?: string[]
  amounts?: string[] // raw mentions, currency handling later
}

export type Label =
  | "plan_contact"
  | "schedule_meeting"
  | "update_contact_info_non_postal"
  | "update_contact_info_postal_address"
  | "update_kyc_activity"
  | "update_kyc_origin_of_assets"
  | "update_kyc_purpose_of_businessrelation"
  | "update_kyc_total_assets"

export interface ValidatedLabel {
  label: Label
  score_adj: number // 0..1 after validation adjustments
  rationale?: string
  spans: EvidenceSpan[] // at least one strong span
}
