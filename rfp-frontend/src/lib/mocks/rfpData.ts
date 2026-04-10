export type RFPStatus = 'new' | 'in-progress' | 'pending-review' | 'pending-approval' | 'approved' | 'rejected' | 'on-hold'
export type RFPRisk = 'low' | 'medium' | 'high' | 'critical'
export type UserRole = 'pm' | 'architect'

export interface RFP {
  id: string
  title: string
  client: string
  clientType: string
  deadline: string
  value: string
  valueRaw: number
  status: RFPStatus
  risk: RFPRisk
  complexity: RFPRisk
  contractLength: string
  paymentTerms: string
  assignedTo: string
  assignedBy: string
  daysRemaining: number
  description: string
  strategicFit: string
  risks: RiskItem[]
  requirements: Requirement[]
  effortEstimation: EffortItem[]
  complianceItems: ComplianceItem[]
}

export interface RiskItem {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export interface Requirement {
  id: string
  section: string
  title: string
  description: string
  mandatory: boolean
}

export interface EffortItem {
  id: string
  phase: string
  weeks: number
  team: string
}

export interface ComplianceItem {
  id: string
  requirement: string
  status: 'compliant' | 'partial' | 'non-compliant' | 'pending'
  response: string
  notes: string
}

export interface User {
  id: string
  name: string
  initials: string
  role: UserRole
  email: string
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Yash Kanvinde',
    initials: 'YK',
    role: 'pm',
    email: 'yash@company.com',
  },
  {
    id: 'u2',
    name: 'Alok Jha',
    initials: 'AJ',
    role: 'architect',
    email: 'alok@company.com',
  },
]

// ─── RFPs ─────────────────────────────────────────────────────────────────────

export const MOCK_RFPS: RFP[] = [
  {
    id: 'rfp-001',
    title: 'Enterprise Cloud Migration Platform',
    client: 'Global Tech Corp',
    clientType: 'Fortune 500 Technology Company',
    deadline: '2026-04-25',
    value: '$2.5M',
    valueRaw: 2500000,
    status: 'pending-approval',
    risk: 'medium',
    complexity: 'high',
    contractLength: '18 months',
    paymentTerms: 'Net 30',
    assignedTo: 'Alok Jha',
    assignedBy: 'Yash Kanvinde',
    daysRemaining: 17,
    description:
      'Full-scale migration of on-premise infrastructure to AWS cloud. Includes data migration, application re-architecture, and staff training across 3 global offices.',
    strategicFit:
      'Aligns with our cloud-first strategy. Strong reference client in Fortune 500 space. High visibility project with potential for multi-year engagement.',
    risks: [
      {
        id: 'r1',
        title: 'Data Migration Complexity',
        severity: 'high',
        description: '15TB of legacy data requires careful planning and rollback strategy.',
      },
      {
        id: 'r2',
        title: 'Compliance Requirements',
        severity: 'medium',
        description: 'SOC2 and ISO27001 certifications required before go-live.',
      },
      {
        id: 'r3',
        title: 'Timeline Pressure',
        severity: 'medium',
        description: 'Client requires completion within 18 months with no flexibility.',
      },
    ],
    requirements: [
      {
        id: 'req1',
        section: 'Technical',
        title: 'Cloud Infrastructure Setup',
        description: 'Design and deploy multi-region AWS infrastructure with 99.9% uptime SLA.',
        mandatory: true,
      },
      {
        id: 'req2',
        section: 'Technical',
        title: 'Data Migration',
        description: 'Migrate 15TB of production data with zero data loss guarantee.',
        mandatory: true,
      },
      {
        id: 'req3',
        section: 'Compliance',
        title: 'SOC2 Certification',
        description: 'Achieve SOC2 Type II certification within 6 months of go-live.',
        mandatory: true,
      },
      {
        id: 'req4',
        section: 'Training',
        title: 'Staff Training Program',
        description: 'Train 200+ staff across 3 offices on new cloud tools.',
        mandatory: false,
      },
    ],
    effortEstimation: [
      { id: 'e1', phase: 'Discovery & Planning', weeks: 4, team: '2 Architects, 1 PM' },
      { id: 'e2', phase: 'Infrastructure Setup', weeks: 8, team: '3 Cloud Engineers' },
      { id: 'e3', phase: 'Data Migration', weeks: 10, team: '2 Data Engineers, 1 DBA' },
      { id: 'e4', phase: 'Testing & UAT', weeks: 4, team: '2 QA, 1 Architect' },
      { id: 'e5', phase: 'Training & Handover', weeks: 2, team: '1 Trainer, 1 PM' },
    ],
    complianceItems: [
      {
        id: 'c1',
        requirement: 'SOC2 Type II Certification',
        status: 'partial',
        response: 'Currently in progress, expected completion Q3 2026.',
        notes: 'Audit scheduled for June 2026',
      },
      {
        id: 'c2',
        requirement: 'ISO 27001',
        status: 'compliant',
        response: 'Certified since 2024, valid until 2027.',
        notes: '',
      },
      {
        id: 'c3',
        requirement: '99.9% Uptime SLA',
        status: 'compliant',
        response: 'Guaranteed via multi-region AWS deployment.',
        notes: '',
      },
      {
        id: 'c4',
        requirement: 'GDPR Data Residency',
        status: 'non-compliant',
        response: 'Currently evaluating EU data center options.',
        notes: 'Blocker — needs resolution before contract signing',
      },
    ],
  },
  {
    id: 'rfp-002',
    title: 'Healthcare Data Analytics Solution',
    client: 'MediCare Systems',
    clientType: 'Healthcare Provider Network',
    deadline: '2026-04-15',
    value: '$1.8M',
    valueRaw: 1800000,
    status: 'pending-approval',
    risk: 'high',
    complexity: 'critical',
    contractLength: '12 months',
    paymentTerms: 'Net 45',
    assignedTo: 'Alok Jha',
    assignedBy: 'Yash Kanvinde',
    daysRemaining: 6,
    description:
      'Build a real-time analytics platform for patient data across 50 hospitals. HIPAA compliance is mandatory.',
    strategicFit:
      'Healthcare vertical expansion aligns with Q2 growth targets. HIPAA expertise differentiates us from competitors.',
    risks: [
      {
        id: 'r1',
        title: 'HIPAA Compliance',
        severity: 'critical',
        description: 'All patient data must meet strict HIPAA requirements.',
      },
      {
        id: 'r2',
        title: 'Real-time Processing',
        severity: 'high',
        description: 'Sub-second query requirements across 50 hospital data sources.',
      },
    ],
    requirements: [
      {
        id: 'req1',
        section: 'Compliance',
        title: 'HIPAA Compliance',
        description: 'Full HIPAA compliance across all data storage and processing.',
        mandatory: true,
      },
      {
        id: 'req2',
        section: 'Technical',
        title: 'Real-time Dashboard',
        description: 'Live patient analytics dashboard with sub-second refresh.',
        mandatory: true,
      },
    ],
    effortEstimation: [
      { id: 'e1', phase: 'Compliance Review', weeks: 3, team: '1 Legal, 1 Architect' },
      { id: 'e2', phase: 'Platform Development', weeks: 16, team: '4 Engineers' },
      { id: 'e3', phase: 'Integration & Testing', weeks: 5, team: '2 QA, 2 Engineers' },
    ],
    complianceItems: [
      {
        id: 'c1',
        requirement: 'HIPAA Privacy Rule',
        status: 'pending',
        response: 'Assessment in progress.',
        notes: 'Need legal review',
      },
      {
        id: 'c2',
        requirement: 'Data Encryption at Rest',
        status: 'compliant',
        response: 'AES-256 encryption implemented.',
        notes: '',
      },
    ],
  },
  {
    id: 'rfp-003',
    title: 'Financial Integration Platform',
    client: 'FinServ Global',
    clientType: 'Financial Services Corporation',
    deadline: '2026-04-20',
    value: '$3.2M',
    valueRaw: 3200000,
    status: 'pending-review',
    risk: 'critical',
    complexity: 'critical',
    contractLength: '24 months',
    paymentTerms: 'Net 30',
    assignedTo: 'Alok Jha',
    assignedBy: 'Yash Kanvinde',
    daysRemaining: 11,
    description:
      'Core banking integration with 12 third-party financial systems. PCI-DSS compliance required.',
    strategicFit:
      'Largest deal in pipeline. Win would establish us as a leader in fintech integrations.',
    risks: [
      {
        id: 'r1',
        title: 'PCI-DSS Compliance',
        severity: 'critical',
        description: 'Full PCI-DSS Level 1 certification required.',
      },
      {
        id: 'r2',
        title: 'Legacy System Integration',
        severity: 'high',
        description: '12 different legacy systems with varying API standards.',
      },
      {
        id: 'r3',
        title: 'Financial Data Security',
        severity: 'critical',
        description: 'Zero tolerance for data breaches. Penalty clauses up to $10M.',
      },
    ],
    requirements: [
      {
        id: 'req1',
        section: 'Compliance',
        title: 'PCI-DSS Level 1',
        description: 'Full certification required before any financial data processing.',
        mandatory: true,
      },
      {
        id: 'req2',
        section: 'Technical',
        title: 'API Integration Layer',
        description: 'Unified API layer connecting 12 legacy financial systems.',
        mandatory: true,
      },
    ],
    effortEstimation: [
      { id: 'e1', phase: 'Security Audit', weeks: 4, team: '2 Security Engineers' },
      { id: 'e2', phase: 'Integration Development', weeks: 20, team: '5 Engineers' },
      { id: 'e3', phase: 'Compliance Testing', weeks: 8, team: '2 QA, 1 Legal' },
    ],
    complianceItems: [
      {
        id: 'c1',
        requirement: 'PCI-DSS Level 1',
        status: 'non-compliant',
        response: 'Certification process not yet started.',
        notes: 'Critical blocker',
      },
      {
        id: 'c2',
        requirement: 'Financial Data Encryption',
        status: 'compliant',
        response: 'End-to-end encryption with HSM key management.',
        notes: '',
      },
    ],
  },
  {
    id: 'rfp-004',
    title: 'Smart City Infrastructure Project',
    client: 'Municipal Services',
    clientType: 'Government Body',
    deadline: '2026-03-30',
    value: '$4.1M',
    valueRaw: 4100000,
    status: 'approved',
    risk: 'low',
    complexity: 'medium',
    contractLength: '36 months',
    paymentTerms: 'Net 60',
    assignedTo: 'Alok Jha',
    assignedBy: 'Yash Kanvinde',
    daysRemaining: 0,
    description: 'Implementation of smart traffic management and public Wi-Fi infrastructure.',
    strategicFit: 'Long-term government contract with recurring revenue potential.',
    risks: [],
    requirements: [],
    effortEstimation: [],
    complianceItems: []
  },
  {
    id: 'rfp-005',
    title: 'Retail Supply Chain Optimization',
    client: 'FastFashion Inc',
    clientType: 'Global Retailer',
    deadline: '2026-04-01',
    value: '$1.2M',
    valueRaw: 1200000,
    status: 'rejected',
    risk: 'high',
    complexity: 'medium',
    contractLength: '12 months',
    paymentTerms: 'Net 30',
    assignedTo: 'Alok Jha',
    assignedBy: 'Yash Kanvinde',
    daysRemaining: -5,
    description: 'AI-driven supply chain forecasting and inventory management.',
    strategicFit: 'Strategic retail account, but rejected due to budget constraints.',
    risks: [],
    requirements: [],
    effortEstimation: [],
    complianceItems: []
  },
  {
    id: 'rfp-006',
    title: 'Blockchain Research Lab',
    client: 'Future Finance',
    clientType: 'Startup',
    deadline: '2026-05-15',
    value: '$0.8M',
    valueRaw: 800000,
    status: 'on-hold',
    risk: 'medium',
    complexity: 'low',
    contractLength: '6 months',
    paymentTerms: 'Upfront',
    assignedTo: 'Alok Jha',
    assignedBy: 'Yash Kanvinde',
    daysRemaining: 35,
    description: 'Establishing a private blockchain testbed for cross-border payments.',
    strategicFit: 'Innovative tech play, but on hold pending Series B funding.',
    risks: [],
    requirements: [],
    effortEstimation: [],
    complianceItems: []
  },
]

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export const DASHBOARD_STATS = {
  activeRFPs: 12,
  pendingReview: 5,
  totalValue: '$10.5M',
  dueThisWeek: 3,
  approvedThisQuarter: 24,
  rejectedThisQuarter: 3,
  awaitingClarification: 5,
}