import type { ResponseValue, RiskLevel } from '../data/riskData'

/** A document uploaded in step 1. Only its description is kept — never its contents. */
export interface UploadedDoc {
  id: string
  name: string
  size: number
  /** Which CHAI document type the reviewer says this is. Unset = not yet counted as evidence. */
  packageId?: string
}

export interface ModifierState {
  /** True when at least one document type that answers this modifier was uploaded. */
  sufficient: boolean
  /** Suggested level. 'Need More Info' when evidence is insufficient. */
  suggested: ResponseValue
  /** One plain sentence on why. */
  rationale: string
  supportingEvidence: string[]
  /** Document types to request when evidence is insufficient (or to raise confidence). */
  missingEvidence: string[]
  /** The reviewer's final selection. Pre-filled with the suggestion when sufficient. */
  selected?: RiskLevel | 'N/A'
}

export type Step = 'intake' | 'levels' | 'mitigations'

export interface Assessment {
  id: string
  solutionName: string
  source: 'vendor' | 'internal'
  vendorName: string
  orgName: string
  reviewerName: string
  description: string
  documents: UploadedDoc[]
  modifiers: Record<string, ModifierState>
  step: Step
  createdAt: string
  updatedAt: string
  submittedAt?: string
}
