// ---------------------------------------------------------------------------
// CHAI evidence packages & evidence examples
//
// Transcribed from CHAI's evidence-package matrix. Packages are grouped by the
// tier that triggers them:
//   core   — requested of all vendors
//   low    — triggered for all vendors (low tier controls)
//   medium — triggered when any risk modifier scores Medium
//   high   — triggered when any risk modifier scores High
// ---------------------------------------------------------------------------

export type EvidenceTier = 'core' | 'low' | 'medium' | 'high'

export interface EvidencePackage {
  id: string
  name: string
  tier: EvidenceTier
  /** Evidence examples, most relevant first. */
  examples: string[]
}

export const TIER_LABELS: Record<EvidenceTier, string> = {
  core: 'Core packages — requested of all vendors',
  low: 'Triggered for all vendors (low tier controls)',
  medium: 'Triggered when any risk modifier scores Medium',
  high: 'Triggered when any risk modifier scores High',
}

export const TIER_ORDER: EvidenceTier[] = ['core', 'low', 'medium', 'high']

export const EVIDENCE_PACKAGES: EvidencePackage[] = [
  {
    id: 'model-card',
    name: 'CHAI Applied Model Card',
    tier: 'core',
    examples: ['CHAI Applied Model Card'],
  },
  {
    id: 'baa-privacy',
    name: 'BAA / Privacy & Data Use Agreement',
    tier: 'core',
    examples: [
      'Business Associate Agreement (BAA) template',
      'Privacy policy',
      'Data Use Agreement',
    ],
  },
  {
    id: 'security-cert',
    name: 'Security Certification Pack',
    tier: 'core',
    examples: [
      'Compliance certification (e.g., SOC 2, HITRUST, ISO 27001)',
      'Audit report',
      'Certification roadmap (if actively pursuing)',
      'Access control documentation / IAM policy',
      'Security documentation / Penetration test',
    ],
  },
  {
    id: 'ops-monitoring',
    name: 'Operations & Monitoring Documentation',
    tier: 'core',
    examples: [
      'Policy document / SLA',
      'Lifecycle / versioning policy',
      'Monitoring plan / Dashboard',
      'Governance documentation / Vendor contact roster',
      'Implementation agreement / KPI document',
      'Disclosure documentation',
      'Re-review schedule / Updated documentation',
    ],
  },
  {
    id: 'workflow-integration',
    name: 'Workflow & Integration Documentation',
    tier: 'core',
    examples: [
      'Workflow diagram / Product documentation',
      'UX review / Example output',
      'Integration documentation / Architecture diagram',
      'Training materials / Curriculum',
      'Feedback system / Help desk process',
    ],
  },
  {
    id: 'validation-plan',
    name: 'Validation Plan / POC Scope',
    tier: 'core',
    examples: [
      'Validation plan',
      'Proof-of-concept scope document',
      'Performance benchmark results',
    ],
  },
  {
    id: 'acceptable-use',
    name: 'Acceptable Use & Training Pack',
    tier: 'low',
    examples: [
      'Acceptable use policy',
      'Training materials / Curriculum',
      'Escalation protocol / SLA',
    ],
  },
  {
    id: 'validation-bias',
    name: 'Validation & Bias Package',
    tier: 'medium',
    examples: [
      'Validation study / Whitepaper / FDA submission',
      'External publication / Pilot summary',
      'Demographic subgroup testing results',
      'Bias evaluation methodology',
      'Bias-and-drift evaluation report',
      'Monitoring plan',
    ],
  },
  {
    id: 'operational-resilience',
    name: 'Operational Resilience Package',
    tier: 'medium',
    examples: [
      'Downtime procedure / Continuity plan / AI-service contingency',
      'Third-party dependency inventory / Contingency plan',
      'Incident response plan / Contract SLA',
      'Performance report / SLA reporting / Notification protocol',
      'Drift response / Escalation protocol',
      'Performance report / Data dashboard',
      'Analytics access / API specification',
    ],
  },
  {
    id: 'usability-evidence',
    name: 'Usability Evidence',
    tier: 'medium',
    examples: [
      'Usability study / User research report / POC results',
      'Analytics report on user override and dismissal rates',
      'Training documentation',
    ],
  },
  {
    id: 'safety-failure',
    name: 'Safety & Failure Analysis Package',
    tier: 'high',
    examples: [
      'Safety surveillance plan / Post-market monitoring protocol',
      'FMEA or equivalent failure-mode analysis',
      'Human factors study / Usability testing report (high-risk settings)',
      'Technical specification / Data quality requirements document / UX specification',
    ],
  },
  {
    id: 'ai-security',
    name: 'AI Security Assessment Package',
    tier: 'high',
    examples: [
      'AI security assessment',
      'Red-team summary',
      'Threat model (prompt injection, jailbreaking, data exfiltration, third-party LLM dependencies)',
    ],
  },
  {
    id: 'transparency-control',
    name: 'Transparency & Control Package',
    tier: 'high',
    examples: [
      'Audit log specification / Sampling protocol',
      'Product demo / UX specification for confidence/uncertainty scores',
      'Risk policy defining suspension/removal conditions',
      'IT runbook / Incident response plan for override and rapid-shutdown',
      'Post-deployment performance monitoring plan / SLA / Contract language',
    ],
  },
]

export const PACKAGE_BY_ID: Record<string, EvidencePackage> = Object.fromEntries(
  EVIDENCE_PACKAGES.map((p) => [p.id, p]),
)

export function packageName(id: string): string {
  return PACKAGE_BY_ID[id]?.name ?? id
}
