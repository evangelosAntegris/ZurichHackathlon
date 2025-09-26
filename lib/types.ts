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
