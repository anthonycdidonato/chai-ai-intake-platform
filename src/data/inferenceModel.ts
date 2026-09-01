// ---------------------------------------------------------------------------
// Inference model: how the platform maps (use case description + uploaded
// evidence) onto a suggested risk level for each of the 19 CHAI risk modifiers.
//
// The model is deliberately rules-based and fully inspectable — every suggestion
// the platform makes can be traced back to (a) a phrase matched in the use case
// description, and/or (b) the presence or absence of a specific evidence
// package. Nothing here is a black box, and nothing leaves the browser.
//
// For each modifier:
//   informingEvidence — evidence packages that can answer this modifier. If none
//                       of them are supplied and no phrase matches, the modifier
//                       is flagged "Need More Info".
//   signals           — phrases in the use case description that indicate a
//                       level. Checked High → Medium → Low (first match wins).
//   evidenceLadder    — when the description is silent, the level implied by how
//                       complete the evidence is. Evaluated best-first: the
//                       first rung whose packages are all present wins.
//   fallback          — level of last resort when evidence exists but is not
//                       specific enough to place on the ladder.
// ---------------------------------------------------------------------------

import type { RiskLevel } from './riskData'

export interface EvidenceRung {
  level: RiskLevel
  allOf: string[]
}

export interface ModifierInference {
  informingEvidence: string[]
  signals?: Partial<Record<RiskLevel, string[]>>
  evidenceLadder?: EvidenceRung[]
  fallback: RiskLevel
}

export const INFERENCE: Record<string, ModifierInference> = {
  // -------------------------------------------------------------- Life & Safety
  'life-01': {
    informingEvidence: ['model-card', 'workflow-integration'],
    signals: {
      High: [
        'diagnos', 'treatment recommendation', 'clinical decision support', 'triage',
        'sepsis', 'bedside', 'point of care', 'patient-facing', 'patient facing',
        'directly with patients', 'medication dosing', 'radiology', 'pathology',
      ],
      Medium: [
        'scheduling', 'appointment', 'transportation', 'chatbot', 'patient portal',
        'intake', 'referral', 'prior authorization', 'care navigation', 'reminder',
      ],
      Low: [
        'back office', 'back-office', 'revenue cycle', 'coding', 'billing',
        'supply chain', 'staffing', 'workflow optimization', 'population health analysis',
        'administrative', 'transcription of meeting',
      ],
    },
    evidenceLadder: [{ level: 'Medium', allOf: ['model-card', 'workflow-integration'] }],
    fallback: 'Medium',
  },
  'life-02': {
    informingEvidence: ['model-card', 'workflow-integration', 'usability-evidence'],
    signals: {
      High: [
        'autonomous', 'without human review', 'no human in the loop', 'acts on its own',
        'automatically orders', 'auto-approve', 'fully automated decision', 'agentic',
      ],
      Medium: [
        'human supervises', 'human on the loop', 'human-on-the-loop', 'clinician can override',
        'reviews exceptions', 'oversight', 'human review of flagged',
      ],
      Low: [
        'human decides', 'human in the loop', 'human-in-the-loop', 'draft for review',
        'recommends', 'suggests', 'informs', 'clinician confirms', 'human confirms',
        'requires approval', 'assistive',
      ],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['model-card', 'workflow-integration', 'usability-evidence'] },
      { level: 'Medium', allOf: ['model-card', 'workflow-integration'] },
    ],
    fallback: 'Medium',
  },
  'life-03': {
    informingEvidence: ['model-card', 'safety-failure', 'validation-bias'],
    signals: {
      High: [
        'death', 'permanent harm', 'disability', 'life-threatening', 'life threatening',
        'critical', 'missed diagnosis', 'medication error', 'dosing', 'sepsis',
        'deterioration', 'stroke', 'sedation', 'ventilator',
      ],
      Medium: [
        'delay in care', 'delays in care', 'inconvenience', 'rescheduling', 'temporary',
        'reversible', 'follow-up required', 'additional testing',
      ],
      Low: [
        'no direct impact', 'no patient impact', 'internal reporting', 'analytics only',
        'administrative only', 'cannot harm',
      ],
    },
    evidenceLadder: [{ level: 'Medium', allOf: ['model-card', 'safety-failure'] }],
    fallback: 'Medium',
  },
  'life-04': {
    informingEvidence: ['model-card', 'workflow-integration'],
    signals: {
      High: [
        'emergency department', 'emergency room', ' icu', 'intensive care', 'operating room',
        'life-critical', 'life critical', 'unstable', 'critically ill', 'oncology',
        'transplant', 'neonatal', 'trauma',
      ],
      Medium: [
        'inpatient', 'urgent care', 'multiple chronic', 'complex patients', 'comorbid',
        'medically complex', 'hospital ward', 'skilled nursing',
      ],
      Low: [
        'outpatient', 'primary care', 'routine annual', 'wellness visit', 'back office',
        'back-office', 'non-clinical', 'administrative',
      ],
    },
    evidenceLadder: [{ level: 'Medium', allOf: ['model-card', 'workflow-integration'] }],
    fallback: 'Medium',
  },
  'life-05': {
    informingEvidence: ['ops-monitoring', 'operational-resilience', 'transparency-control'],
    signals: {
      High: ['no monitoring', 'manual monitoring', 'monitoring to be developed', 'no dashboard'],
      Medium: ['periodic reports', 'partial monitoring', 'batch monitoring', 'monthly review'],
      Low: [
        'real-time monitoring', 'real time monitoring', 'embedded monitoring',
        'continuous monitoring', 'monitoring is real-time', 'monitoring is real time',
        'monitoring dashboard', 'automated drift detection',
      ],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['ops-monitoring', 'operational-resilience', 'transparency-control'] },
      { level: 'Medium', allOf: ['ops-monitoring'] },
    ],
    fallback: 'Medium',
  },
  'life-06': {
    informingEvidence: ['model-card', 'workflow-integration', 'safety-failure'],
    signals: {
      High: [
        'real-time alert', 'immediate action', 'seconds', 'minutes', 'emergency',
        'no time for review', 'time-critical', 'time critical',
      ],
      Medium: ['same day', 'same-day', 'within hours', 'shift', 'limited time'],
      Low: ['days', 'weeks', 'retrospective', 'batch', 'quarterly', 'ample time', 'reviewed before'],
    },
    evidenceLadder: [{ level: 'Medium', allOf: ['model-card', 'workflow-integration'] }],
    fallback: 'Medium',
  },
  'life-07': {
    informingEvidence: ['model-card', 'workflow-integration', 'safety-failure'],
    signals: {
      High: [
        'enterprise-wide', 'enterprise wide', 'all patients', 'system-wide', 'system wide',
        'across all sites', 'regional', 'population-wide', 'health system wide', 'all facilities',
      ],
      Medium: [
        'multiple clinics', 'multiple units', 'several departments', 'multiple sites',
        'service line', 'half of', 'across the department', 'multiple hospitals',
        'three hospitals', 'two hospitals', 'four hospitals', 'several hospitals',
        'across our hospitals',
      ],
      Low: [
        'single clinic', 'one clinic', 'single site', 'one site', 'pilot', 'single department',
        'limited geographical', 'rare disease',
      ],
    },
    evidenceLadder: [{ level: 'Medium', allOf: ['model-card', 'workflow-integration'] }],
    fallback: 'Medium',
  },
  'life-08': {
    informingEvidence: ['workflow-integration', 'operational-resilience', 'security-cert'],
    signals: {
      High: [
        'deeply embedded', 'writes back to the ehr', 'writes to the ehr', 'orders are placed',
        'downstream systems', 'multiple integrations', 'feeds other models', 'resource allocation',
      ],
      Medium: [
        'integrated with the ehr', 'ehr integration', 'integrates with', 'api integration',
        'specific module', 'hl7', 'fhir integration',
      ],
      Low: ['standalone', 'stand-alone', 'isolated', 'no integration', 'read-only', 'read only'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['workflow-integration', 'operational-resilience'] },
      { level: 'Medium', allOf: ['workflow-integration'] },
    ],
    fallback: 'Medium',
  },
  'life-09': {
    informingEvidence: ['validation-bias', 'model-card'],
    signals: {
      High: [
        'no subgroup', 'no bias evaluation', 'underserved', 'vulnerable population',
        'social determinants', 'medicaid', 'safety net', 'health equity risk',
      ],
      Medium: ['subgroup analysis planned', 'bias evaluation planned', 'limited subgroup', 'partial subgroup'],
      Low: ['subgroup testing', 'demographic subgroup', 'bias evaluation completed', 'equity audit', 'fairness testing'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['validation-bias', 'model-card'] },
      { level: 'Medium', allOf: ['validation-bias'] },
    ],
    fallback: 'Medium',
  },

  // ------------------------------------------------------------ Technology & Data
  'tech-01': {
    informingEvidence: ['baa-privacy', 'model-card', 'security-cert'],
    signals: {
      High: [
        'phi', 'protected health information', 'personally identifiable', 'pii',
        'identified patient data', 'patient names', 'mrn', 'social security',
        'genomic', 'behavioral health records', 'substance use records',
      ],
      Medium: ['de-identified', 'deidentified', 'safe harbor', 'limited data set', 'expert determination'],
      Low: ['synthetic data', 'synthetic', 'nonconfidential', 'non-confidential', 'public data', 'no patient data'],
    },
    evidenceLadder: [
      { level: 'Medium', allOf: ['baa-privacy', 'security-cert', 'model-card'] },
      { level: 'High', allOf: ['baa-privacy'] },
    ],
    fallback: 'High',
  },
  'tech-02': {
    informingEvidence: ['model-card', 'validation-plan', 'validation-bias'],
    signals: {
      High: ['unvalidated', 'free text', 'free-text', 'no standardization', 'inconsistent coding', 'no harmonization'],
      Medium: ['partial mapping', 'some inconsistency', 'reconciliation', 'multi-site extract', 'cross-check'],
      Low: ['icd', 'snomed', 'loinc', 'fhir', 'automated validation', 'deduplication', 'standardized'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['model-card', 'validation-plan', 'validation-bias'] },
      { level: 'Medium', allOf: ['model-card', 'validation-plan'] },
    ],
    fallback: 'Medium',
  },
  'tech-03': {
    informingEvidence: ['model-card', 'validation-plan', 'validation-bias'],
    signals: {
      High: ['high missingness', 'incomplete data', 'fragmented', 'sparse data', 'gaps in coverage'],
      Medium: ['imputation', 'some missing', 'partial coverage', 'incomplete fields'],
      Low: ['complete data', 'well-populated', 'integrity checks', 'full coverage'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['model-card', 'validation-plan', 'validation-bias'] },
      { level: 'Medium', allOf: ['model-card', 'validation-plan'] },
    ],
    fallback: 'Medium',
  },
  'tech-04': {
    informingEvidence: ['model-card', 'validation-bias', 'ops-monitoring'],
    signals: {
      High: ['opaque source', 'unknown provenance', 'scraped', 'stale data', 'outdated data', 'ad-hoc data pull'],
      Medium: ['vendor-managed dataset', 'vendor managed dataset', 'lagged refresh', 'multi-site extract', 'quarterly refresh'],
      Low: ['national registry', 'certified registry', 'clear provenance', 'reputable source', 'daily refresh', 'nightly refresh'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['model-card', 'validation-bias', 'ops-monitoring'] },
      { level: 'Medium', allOf: ['model-card'] },
    ],
    fallback: 'Medium',
  },
  'tech-05': {
    informingEvidence: ['model-card', 'validation-plan'],
    signals: {
      High: ['proprietary model', 'no documentation of training data', 'undisclosed training data', 'black box', 'closed model'],
      Medium: ['some documentation', 'partial documentation', 'summary of training data'],
      Low: ['data dictionary', 'data catalog', 'data provenance', 'developed internally', 'full documentation'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['model-card', 'validation-plan'] },
      { level: 'Medium', allOf: ['model-card'] },
    ],
    fallback: 'High',
  },
  'tech-06': {
    informingEvidence: ['validation-bias', 'model-card', 'validation-plan'],
    signals: {
      High: ['single site training', 'narrow dataset', 'small dataset', 'few sites', 'no historical', 'not representative'],
      Medium: ['limited depth', 'limited breadth', 'missing subgroups', 'adequate for the primary population'],
      Low: ['longitudinal', 'large and representative', 'multi-site training', 'representative of the population'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['validation-bias', 'model-card', 'validation-plan'] },
      { level: 'Medium', allOf: ['validation-bias'] },
    ],
    fallback: 'Medium',
  },
  'tech-07': {
    informingEvidence: ['security-cert', 'ai-security', 'workflow-integration'],
    signals: {
      High: ['internet-facing', 'internet facing', 'public endpoint', 'third-party llm', 'third party llm', 'external api', 'patient-facing web'],
      Medium: ['internal-facing', 'internal facing', 'within the network', 'hosted in our cloud tenant', 'vpn'],
      Low: ['application-bound', 'on-premise', 'on premises', 'air-gapped', 'no external interfaces', 'self-contained'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['security-cert', 'ai-security', 'workflow-integration'] },
      { level: 'Medium', allOf: ['security-cert'] },
    ],
    fallback: 'High',
  },
  'tech-08': {
    informingEvidence: ['ops-monitoring', 'validation-plan', 'operational-resilience'],
    signals: {
      High: ['continuously learns', 'continuous learning', 'no version', 'unversioned', 'updates pushed without validation', 'no rollback'],
      Medium: ['periodic retraining', 'manual updates', 'partial validation', 'quarterly release'],
      Low: ['versioned', 'version control', 'staged rollout', 'canary', 'rollback capability', 'static model', 'frozen model'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['ops-monitoring', 'validation-plan', 'operational-resilience'] },
      { level: 'Medium', allOf: ['ops-monitoring'] },
    ],
    fallback: 'Medium',
  },
  'tech-09': {
    informingEvidence: ['ops-monitoring', 'operational-resilience', 'validation-bias'],
    signals: {
      High: ['no drift monitoring', 'no incident response', 'no monitoring', 'no alerting'],
      Medium: ['batch monitoring', 'aggregate monitoring', 'manual review of anomalies', 'periodic monitoring'],
      Low: ['continuous monitoring', 'automated alerts', 'drift detection', 'anomaly detection', 'incident management integration'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['ops-monitoring', 'operational-resilience', 'validation-bias'] },
      { level: 'Medium', allOf: ['ops-monitoring'] },
    ],
    fallback: 'Medium',
  },
  'tech-10': {
    informingEvidence: ['transparency-control', 'workflow-integration', 'ops-monitoring'],
    signals: {
      High: ['not disclosed', 'invisible to users', 'no labeling', 'no audit trail', 'users are unaware'],
      Medium: ['partially labeled', 'some outputs labeled', 'partial audit trail'],
      Low: ['clearly labeled', 'ai-generated label', 'full audit trail', 'audit log', 'users are informed', 'disclosure to patients'],
    },
    evidenceLadder: [
      { level: 'Low', allOf: ['transparency-control', 'workflow-integration'] },
      { level: 'Medium', allOf: ['workflow-integration'] },
    ],
    fallback: 'Medium',
  },
}
