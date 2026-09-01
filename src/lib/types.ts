import type { ResponseValue, RiskLevel } from '../data/riskData'

export type OrgType = 'vendor' | 'hdo'

export interface EvidenceFile {
  id: string
  /** Evidence package this document was filed under. */
  packageId: string
  /** Optional specific evidence example the uploader selected. */
  example?: string
  name: string
  size: number
  type: string
  uploadedAt: string
  /** Which step of the workflow this file arrived at. */
  addedDuring: 'intake' | 'review'
}

export interface ModifierState {
  /** Level the platform suggested from evidence + description. */
  suggested: ResponseValue
  /** Human-readable trace of why. */
  rationale: string
  /** Evidence packages that supported the suggestion. */
  supportingEvidence: string[]
  /** Evidence packages that are missing and would resolve the modifier. */
  missingEvidence: string[]
  confidence: 'High' | 'Medium' | 'Low'
  /** User's override of the suggested level, if any. */
  override?: ResponseValue
  /** Relative weight applied to this modifier, 0–3. Default 1. */
  weight: number
  notes?: string
}

export interface DomainResult {
  domainId: string
  domainName: string
  /** Highest response present, per the CHAI tool's own guidance. */
  chaiLevel: RiskLevel | 'Need More Info'
  /** Weighted composite band. */
  weightedLevel: RiskLevel
  weightedScore: number
  counts: Record<ResponseValue, number>
}

export interface Determination {
  /** Faithful to the CHAI tool: overall = highest modifier response. */
  chaiOverall: RiskLevel | 'Need More Info'
  /** Member-adjusted weighted composite. */
  weightedOverall: RiskLevel
  weightedScore: number
  /** Level the platform recommends the member accept. */
  suggestedOverall: RiskLevel | 'Need More Info'
  highCount: number
  needsInfoCount: number
  domains: DomainResult[]
}

export type SessionStatus = 'draft' | 'categorized' | 'accepted'

export interface IntakeSession {
  id: string
  orgName: string
  orgType: OrgType
  submitterName: string
  submitterEmail: string
  solutionName: string
  useCase: string
  evidence: EvidenceFile[]
  modifiers: Record<string, ModifierState>
  status: SessionStatus
  createdAt: string
  updatedAt: string
  acceptedAt?: string
  acceptedBy?: string
  /** Overall level the member accepted as final. */
  finalOverall?: RiskLevel
  finalNote?: string
}
