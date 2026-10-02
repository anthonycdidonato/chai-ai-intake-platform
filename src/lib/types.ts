import type { ResponseValue, RiskLevel } from '../data/riskData'

/** A document the reviewer has received from the vendor. */
export interface EvidenceItem {
  id: string
  /** Evidence package this document was filed under. */
  packageId: string
  /** Optional specific evidence example the reviewer selected. */
  example?: string
  name: string
  /** Where in the workflow this was added. */
  addedDuring: 'intake' | 'review'
}

export interface ModifierState {
  /** Level the platform suggested from the description and documentation. */
  suggested: ResponseValue
  /** Why — a plain-language trace the reviewer can check. */
  rationale: string
  /** Evidence packages that supported the suggestion. */
  supportingEvidence: string[]
  /** Evidence packages that would resolve the modifier if supplied. */
  missingEvidence: string[]
  confidence: 'High' | 'Medium' | 'Low'
  /** The reviewer's confirmed level. Set once they accept or change it. */
  confirmed?: ResponseValue
  notes?: string
}

export interface DomainResult {
  domainId: string
  domainName: string
  /** Highest modifier level in the domain. */
  level: RiskLevel | 'Need More Info'
  counts: Record<ResponseValue, number>
}

export interface Determination {
  /** Highest modifier level across both domains. */
  overall: RiskLevel | 'Need More Info'
  highCount: number
  needsInfoCount: number
  /** How many of the 19 modifiers the reviewer has explicitly confirmed. */
  confirmedCount: number
  domains: DomainResult[]
}

export type Step = 'describe' | 'categorize' | 'mitigate' | 'report'

export interface Assessment {
  id: string
  /** The organization doing the review. */
  reviewerOrg: string
  reviewerName: string
  /** The vendor and solution under review. */
  vendorName: string
  solutionName: string
  useCase: string
  evidence: EvidenceItem[]
  modifiers: Record<string, ModifierState>
  step: Step
  createdAt: string
  updatedAt: string
  /** Set when the reviewer accepts the categorization and moves to mitigations. */
  categorizationAcceptedAt?: string
}
