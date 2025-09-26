import type {
  Client,
  Conversation,
  ProfessionalBackground,
  FinancialPreferences,
  CommunicationPreferences,
  RecentInteraction,
  UpcomingMeeting,
  RecommendedAction,
} from "./types"

export const mockClients: Client[] = [
  {
    id: "client-1",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    dateOfBirth: "1963-09-24",
    age: 60,
    maritalStatus: "Divorced",
    riskProfile: "Conservative",
    lastContact: "2025-01-10",
    aum: "$2.6M",
    additionalInfo:
      "Planning to retire in 2 years. Focused on wealth preservation. Recently widowed, adjusting to single income.",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2025-01-10T14:30:00Z",
  },
  {
    id: "client-2",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    dateOfBirth: "1975-03-15",
    age: 49,
    maritalStatus: "Married",
    riskProfile: "Moderate",
    lastContact: "2025-01-08",
    aum: "$1.8M",
    additionalInfo: "Tech executive looking to diversify portfolio. Two children approaching college age.",
    createdAt: "2023-03-20T09:00:00Z",
    updatedAt: "2025-01-08T11:15:00Z",
  },
]

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    clientId: "client-1",
    title: "Retirement Income Planning",
    date: "2025-01-10",
    duration: "50 min",
    type: "call",
    summary:
      "Alice expressed concerns about retirement income sustainability given recent market volatility. Discussed converting traditional IRA to Roth IRA for tax diversification. She's interested in increasing bond allocation from 40% to 50% to reduce portfolio risk. Action items: Review current asset allocation, prepare Roth conversion analysis, schedule follow-up in 2 weeks.",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "conv-2",
    clientId: "client-1",
    title: "Portfolio Review Q4",
    date: "2024-12-15",
    duration: "35 min",
    type: "meeting",
    summary:
      "Q4 portfolio review showed strong performance with 8.2% annual return. Alice satisfied with conservative approach but concerned about inflation impact. Discussed I-bonds and TIPS as inflation hedges. She approved rebalancing to target allocation. Next steps: Execute rebalancing trades, research additional inflation-protected securities.",
    createdAt: "2024-12-15T14:00:00Z",
    updatedAt: "2024-12-15T15:00:00Z",
  },
  {
    id: "conv-3",
    clientId: "client-1",
    title: "Estate Planning Discussion",
    date: "2024-11-22",
    duration: "45 min",
    type: "call",
    summary:
      "Estate planning discussion focused on updating beneficiaries after divorce. Alice wants to establish trust for grandchildren's education. Discussed charitable giving strategies for tax benefits. She needs to update will and power of attorney documents. Follow-up: Connect with estate attorney, review trust options.",
    createdAt: "2024-11-22T10:30:00Z",
    updatedAt: "2024-11-22T11:30:00Z",
  },
  {
    id: "conv-4",
    clientId: "client-1",
    title: "Tax Optimization Strategy",
    date: "2024-10-18",
    duration: "30 min",
    type: "meeting",
    summary:
      "Tax optimization review identified opportunities for tax-loss harvesting in taxable account. Alice interested in municipal bonds for tax-free income. Discussed Roth IRA conversion ladder strategy. She approved harvesting $15K in losses. Next actions: Execute tax-loss harvesting, research muni bond options.",
    createdAt: "2024-10-18T13:00:00Z",
    updatedAt: "2024-10-18T13:45:00Z",
  },
]

export const mockProfessionalBackgrounds: ProfessionalBackground[] = [
  {
    id: "prof-1",
    clientId: "client-1",
    occupation: "Business Owner, Manufacturing",
    education: "MS Engineering, MIT",
    industry: "Manufacturing",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
]

export const mockFinancialPreferences: FinancialPreferences[] = [
  {
    id: "fin-1",
    clientId: "client-1",
    investmentStyle: "Aggressive growth",
    esgPreference: "Low priority",
    liquidityNeeds: "Low",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2024-06-15T14:00:00Z",
  },
]

export const mockCommunicationPreferences: CommunicationPreferences[] = [
  {
    id: "comm-1",
    clientId: "client-1",
    preferredContact: "In-person",
    meetingFrequency: "Bi-monthly",
    reportDetailLevel: "Comprehensive",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
]

export const mockRecentInteractions: RecentInteraction[] = [
  {
    id: "int-1",
    clientId: "client-1",
    date: "2025-03-20",
    description: "Updated risk profile last week",
    type: "update",
    createdAt: "2025-03-20T10:00:00Z",
  },
  {
    id: "int-2",
    clientId: "client-1",
    date: "2025-03-06",
    description: "Quarterly portfolio review call",
    type: "call",
    createdAt: "2025-03-06T14:00:00Z",
  },
]

export const mockUpcomingMeetings: UpcomingMeeting[] = [
  {
    id: "meet-1",
    clientId: "client-1",
    date: "2025-02-05",
    title: "Estate Planning Review",
    type: "meeting",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "meet-2",
    clientId: "client-1",
    date: "2025-02-20",
    title: "Healthcare Cost Analysis",
    type: "analysis",
    createdAt: "2025-01-15T10:00:00Z",
  },
]

export const mockRecommendedActions: RecommendedAction[] = [
  {
    id: "action-1",
    clientId: "client-1",
    title: "Portfolio Rebalancing",
    description: "Technology sector overweight by 7% relative to target allocation",
    priority: "high",
    category: "portfolio",
    completed: false,
    dueDate: "2025-02-15",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "action-2",
    clientId: "client-1",
    title: "Tax-Loss Harvesting",
    description: "Potential savings of $32,500 before year-end",
    priority: "medium",
    category: "tax",
    completed: false,
    dueDate: "2025-12-31",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "action-3",
    clientId: "client-1",
    title: "Meeting Preparation",
    description: "Estate Planning Review on Feb 5, 2025",
    priority: "medium",
    category: "meeting",
    completed: false,
    dueDate: "2025-02-05",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "action-4",
    clientId: "client-1",
    title: "Risk Assessment Update",
    description: "Last assessment completed 6 months ago",
    priority: "low",
    category: "risk",
    completed: false,
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
]
