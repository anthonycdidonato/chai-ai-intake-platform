// ---------------------------------------------------------------------------
// CHAI risk mitigation library.
//
// Transcribed from the CHAI Risk Mitigation Mapping workbook (v7, 1 Oct 2026),
// "Mitigation Library" tab. Four columns are carried:
//
//   B  Mitigation          -> name
//   D  Risk Level Applied  -> appliesAt
//   G  Description         -> description
//
// and two are used for routing only, never displayed as their own field:
//
//   E  Domain(s)             -> domains
//   F  Mapped risk modifiers -> modifiers (LPS01-09 -> life-01..09,
//                                          TD01-10  -> tech-01..10)
//
// A mitigation is triggered when any modifier it maps to has been confirmed at
// a level the mitigation applies at. So "High" controls appear only where a
// mapped modifier came out High, while "Low, Medium, High" controls are
// baseline and apply wherever their modifiers are in play.
// ---------------------------------------------------------------------------

import type { RiskLevel } from './riskData'

export interface Mitigation {
  /** Library id from the workbook, e.g. "M09". */
  id: string
  /** Column B. */
  name: string
  /** Column D — the confirmed levels at which this control applies. */
  appliesAt: RiskLevel[]
  /** Column E — routing only. */
  domains: string[]
  /** Column F — routing only. Risk modifier ids this control mitigates. */
  modifiers: string[]
  /** Column G. */
  description: string
}

export const MITIGATION_SOURCE =
  'CHAI Risk Mitigation Mapping workbook (v7, October 2026) — Mitigation Library'

export const MITIGATIONS: Mitigation[] = [
  {
    id: 'M09',
    name: 'Data Minimization',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-01', 'life-08'],
    description:
      'Collect, access, process, retain, expose, share, and log only the minimum data necessary for the AI\'s purpose. In healthcare AI this \'minimum necessary\' standard applies not only to source data but also to prompts, outputs, logs, embeddings, audit records, and any data accessible to the vendor, and should be confirmed during AI intake and data-flow review.',
  },
  {
    id: 'M10',
    name: 'Access Controls & Role-Based Permissions',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-01', 'tech-07', 'life-08'],
    description:
      'Restrict data and system access to authorized roles using least-privilege permissions. Apply this to human and non-human identities alike — users, administrators, developers, vendor support staff, service accounts, AI agents, APIs, model endpoints, datasets, prompts, logs, and evaluation artifacts — because AI systems frequently involve non-human identities and downstream integrations that role-based permissions alone do not cover.',
  },
  {
    id: 'M29',
    name: 'Identity Verification / Authentication for Access',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-07', 'tech-01'],
    description:
      'Require strong authentication and identity assurance (e.g., MFA) before granting access to AI systems or sensitive data. Extend this beyond MFA for human users to include privileged-access controls, service-account governance, distinct identities for AI agents, API credential rotation, and periodic access reviews so the control is realistic for agentic, API-driven, and automated workflows.',
  },
  {
    id: 'M30',
    name: 'Data Encryption (at rest & in transit)',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-01', 'tech-07'],
    description:
      'Encrypt sensitive data both stored and transmitted to protect confidentiality. Clarify scope and ownership — including key management, TLS/certificate standards, secrets management, backups, logs, vector databases, model artifacts, and third-party transfer channels — and confirm who is responsible when data is hosted outside the organization\'s network.',
  },
  {
    id: 'M31',
    name: 'Safe Harbor De-identification',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-01'],
    description:
      'Apply HIPAA Safe Harbor de-identification (removal of the 18 direct identifiers) where appropriate to reduce confidentiality risk before use. Because Safe Harbor may still leave residual re-identification risk through linkage or context, document that residual risk, prohibit re-identification, and add safeguards for free text, small populations, rare conditions, and highly sensitive use cases; where identifiers are genuinely required for the function (e.g., direct patient care), scrutinize the use case through security, legal, and responsible-AI review and define compensating controls.',
  },
  {
    id: 'M32',
    name: 'Synthetic Data Generation',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-01', 'tech-06'],
    description:
      'Use validated synthetic datasets in place of identifiable data for development, testing, or demonstration where appropriate. Do not treat synthetic data as automatically safe or de-identified: document the generation method, privacy-risk assessment, and utility testing, since synthetic datasets can still leak patterns or membership information depending on how they were generated.',
  },
  {
    id: 'M33',
    name: 'Data Anonymization Preprocessing',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-01', 'tech-06'],
    description:
      'Apply de-identification, pseudonymization, tokenization, redaction, or masking to sensitive data elements before training or inference, as appropriate, to prevent leakage at inference. Validate that sensitive information is not retained in prompts, embeddings, model outputs, logs, or downstream datasets, and where sensitive elements are genuinely required, scrutinize the use case and define compensating guardrails.',
  },
  {
    id: 'M34',
    name: 'Secure Asset Sharing',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-07', 'life-08', 'tech-01'],
    description:
      'Share models and datasets with internal or external parties only through controlled, approved, and logged channels. Treat the full set of AI assets as in scope — datasets, model weights, prompts and system instructions, evaluation datasets, embeddings/vector stores, configuration files, audit logs, and output samples — and ensure a data use agreement, BAA, or contract covers the sharing where applicable.',
  },
  {
    id: 'M71',
    name: 'Expert-Determination De-identification',
    appliesAt: ['High'],
    domains: ['technology-data'],
    modifiers: ['tech-01'],
    description:
      'Obtain a statistical expert determination that re-identification risk is very small before using highly sensitive data, as the second HIPAA-recognized de-identification method distinct from Safe Harbor. Require documentation of the qualified expert, method, assumptions, residual-risk determination, permitted-use boundaries, and reassessment triggers when the data, use case, recipient, or linkage environment changes.',
  },
  {
    id: 'M72',
    name: 'Differential Privacy',
    appliesAt: ['High'],
    domains: ['technology-data'],
    modifiers: ['tech-01', 'tech-06'],
    description:
      'Add mathematically bounded noise so individual records cannot be inferred from model behavior or outputs. Position this as an advanced, use-case-dependent privacy-engineering control — for aggregate analytics, model training, or reporting where individual-contribution inference is a material risk — rather than a universal baseline, and document the privacy budget, utility trade-offs, and validation approach.',
  },
  {
    id: 'M73',
    name: 'Data Separation / Segregation',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-08', 'tech-01', 'tech-07'],
    description:
      'Isolate sensitive datasets and environments to limit cross-system exposure and blast radius. Separate production, development, testing, training, validation, and sandbox environments; isolate sensitive datasets by classification and use case; and prevent cross-client, cross-purpose, or unauthorized model-training reuse, since PHI exposure often occurs through environment sprawl or secondary use.',
  },
  {
    id: 'M22',
    name: 'Baseline Data Quality Profiling',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-02', 'tech-03', 'tech-06', 'tech-04'],
    description:
      'Profile data accuracy, completeness, coverage, and freshness before use. Be explicit about which data is being profiled — training data, local validation data, or the live data the deployed solution will ingest — and about who owns the result, since in many organizations this work falls to Clinical Informatics, Business Intelligence, or IT rather than a dedicated data-quality team.',
  },
  {
    id: 'M36',
    name: 'Automated Data Validation (range/semantic checks)',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-02', 'tech-03'],
    description:
      'Run automated range, semantic, and conformance checks to catch invalid or out-of-bounds values. Embed these checks in the data pipelines and interfaces that feed the AI solution so failures are caught before inference, and assign ownership to the team that operates the data platform or application.',
  },
  {
    id: 'M37',
    name: 'Coding-Standard / Ontology Conformance',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-02'],
    description:
      'When clinical, claims, laboratory, medication, or interoperability data are used, standardize to the appropriate terminology and exchange standards (e.g., ICD, SNOMED CT, LOINC, RxNorm, CPT, HL7/FHIR) or documented local enterprise data standards for consistent, correct coding. Make this conditional on the use case, since not all healthcare AI relies on the same terminology standards.',
  },
  {
    id: 'M38',
    name: 'Deduplication & Identifier Consistency',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-02', 'tech-03'],
    description:
      'Detect duplicates and reconcile inconsistent identifiers across sources. Anchor this to the organization\'s master patient index / identity-management processes so the AI solution inherits the same patient- and provider-matching rules as the rest of the enterprise.',
  },
  {
    id: 'M39',
    name: 'Missingness & Completeness Checks',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-03'],
    description:
      'Run automated integrity checks for missing fields, partial coverage, and data fragmentation. Define what level of missingness is acceptable for the specific use case with the clinical or business owner, since the tolerance differs greatly between, for example, a documentation aid and a risk-prediction model.',
  },
  {
    id: 'M40',
    name: 'Data Versioning',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-03', 'tech-08', 'tech-04'],
    description:
      'Version datasets, feature sets, labels, prompts, retrieval corpora, model configurations, and evaluation datasets so changes are tracked, reproducible, and auditable. Dataset versioning alone is insufficient for AI governance; the model, prompt, and configuration context must also be traceable to the data used.',
  },
  {
    id: 'M41',
    name: 'Manual Data Review',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-02', 'tech-03', 'tech-04'],
    description:
      'Use risk-based human review of representative data samples to catch semantic, clinical, and workflow-context quality issues that automated checks miss. Scale the depth of review to the use case — especially for high-impact, clinical, patient-facing, novel, or poor-quality data sources — rather than requiring the same level of manual review everywhere.',
  },
  {
    id: 'M76',
    name: 'Imputation & Reconciliation vs Reference Data',
    appliesAt: ['High'],
    domains: ['technology-data'],
    modifiers: ['tech-03', 'tech-02'],
    description:
      'Use imputation or reconciliation against reference data only when methodologically appropriate; document assumptions, source of reference data, clinical/business rationale, effect on subgroups, and whether imputed fields are visible to downstream users or models. Poorly governed imputation can introduce false confidence, and for many clinical use cases imputation is inappropriate and missing data should instead be surfaced to the user.',
  },
  {
    id: 'M79',
    name: 'Gold-Standard Validation Dataset',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-02', 'tech-06', 'life-03'],
    description:
      'Use curated, labeled validation or benchmark datasets appropriate to the use case to validate model accuracy before and after deployment, with documented labeling source, adjudication process, population representativeness, refresh cadence, and limitations. Not every AI solution needs a perfect external benchmark, but high-risk clinical tools should have a stronger, locally relevant validation dataset that is separate from any training data.',
  },
  {
    id: 'M80',
    name: 'Sanitize Training Data',
    appliesAt: ['High'],
    domains: ['technology-data'],
    modifiers: ['tech-02', 'tech-07', 'tech-08'],
    description:
      'Cleanse and filter training, fine-tuning, retrieval (RAG), and evaluation data to remove corrupt, poisoned, malicious, prohibited, low-quality, duplicated, or policy-disallowed records before use. This applies to both generative and non-generative AI, since training-data poisoning and related integrity risks are recognized as major AI application concerns (e.g., in OWASP LLM guidance).',
  },
  {
    id: 'M18',
    name: 'Limit / Scope Initial Deployment (Pilot)',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-07', 'life-04'],
    description:
      'Where practical and appropriate, begin with a limited initial deployment — a single site or department, a sandbox or simulation, a limited user group, or a defined patient population — with predefined safety criteria, in order to validate local performance and workflow fit as well as contain potential harm. Pilot scope should be proportionate to risk: low-risk solutions may warrant broader initial deployment, while narrow pilots can produce poor insights and limited generalizability if run too long.',
  },
  {
    id: 'M64',
    name: 'Limit Public Release of Information/Capability',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-07', 'tech-01', 'tech-07'],
    description:
      'Restrict release of capabilities, interfaces, data, or documentation that create meaningful potential for misuse or for privacy, security, intellectual-property, or patient-safety harm, applying HIPAA minimum-necessary principles to information sharing. Define release criteria and authorized audiences explicitly (within the organization, within the tool\'s own controls, or externally), while preserving the transparency needed for public accountability.',
  },
  {
    id: 'M65',
    name: 'Cross-System Integration Risk Assessment',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-08', 'tech-08'],
    description:
      'Assess how the AI integrates with other systems — specifically the EHR, interface engines, downstream clinical and financial systems, and any other AI solutions/systems it exchanges data or actions with — and where failures could propagate. Explicitly assess the additive effects of multiple AI solutions/systems operating together, since risks can be magnified when agents chain.',
  },
  {
    id: 'M99',
    name: 'Containment / Isolation of AI Service',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-08', 'tech-07', 'life-06'],
    description:
      'Use risk-based architectural and operational containment — such as bounded permissions, privileged-access limits, rate limits, sandboxing, and defined integration boundaries — to minimize the blast radius when the AI fails, recognizing that failures may still propagate. Full isolation is often not technically possible or desirable in highly integrated platforms (e.g., an enterprise EHR), so where isolation is impractical, substitute significant review and ongoing monitoring of integration points.',
  },
  {
    id: 'M100',
    name: 'Fail-Safe / Graceful Degradation Design',
    appliesAt: ['High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-06', 'life-08', 'life-03'],
    description:
      'Design safe default behavior and graceful degradation when the AI fails or is unavailable, so that clinical care and operations continue via a defined non-AI workflow. Define what \'safe default\' means for the specific clinical or behavioral-health context, and acknowledge that some failures may require the AI (and impacted functions) to be fully suspended rather than degraded.',
  },
  {
    id: 'M04',
    name: 'Model Documentation / Model Card',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-05', 'tech-08', 'life-04'],
    description:
      'Maintain structured documentation of model purpose, training data, performance, limitations, and intended use, including the clinical validation methodology and the populations represented. Model cards only reduce risk when they are complete and understandable by the intended audience (e.g., clinical and operational reviewers, not only data scientists), and they should be obtained and reviewed as part of the initial intake assessment.',
  },
  {
    id: 'M05',
    name: 'Data Catalog & Data Dictionary',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-05', 'tech-02', 'tech-03'],
    description:
      'Maintain a documented inventory of datasets with field-level definitions, formats, and coding standards, covering both the data used to train or validate the model and the local data the deployed solution ingests. For vendor solutions, full training-data catalogs may not be available due to proprietary concerns, so request at minimum enough provenance to verify what data informs the model\'s outputs.',
  },
  {
    id: 'M06',
    name: 'Documentation Standards & Versioned Records',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-05', 'tech-08'],
    description:
      'Apply consistent, versioned documentation conventions across the AI lifecycle so that the documentation at any point can be identified. Treat this as a maturity goal proportionate to risk — rapidly evolving applications make full versioning difficult, and for vendor products the obligation rests largely with the vendor, with the health system versioning its own governance records (approvals, validations, configuration decisions).',
  },
  {
    id: 'M26',
    name: 'Data Provenance & Lineage Records',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-04', 'tech-05', 'tech-03'],
    description:
      'Maintain traceable records of where data originated and how it was transformed through the pipeline — including the source system (e.g., EHR), whether the data was de-identified, and any consent or use restrictions attached to it. For third-party products, lineage into the vendor\'s training data is often not accessible; expect it to be available from the vendor on request rather than as an ongoing view.',
  },
  {
    id: 'M82',
    name: 'Algorithmic Bias Testing & Mitigation',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-09', 'tech-06'],
    description:
      'Test for disparate performance across relevant groups and apply techniques to reduce bias, distinguishing the specific types of bias assessed (e.g., data representation, label, measurement, algorithmic, and deployment/automation bias). Where bias is known but cannot be fully mitigated, create awareness for users and document it, and make this a cross-functional activity rather than a data-science-only task.',
  },
  {
    id: 'M01',
    name: 'AI Governance & Use Policy',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-05', 'life-04', 'tech-08'],
    description:
      'Establish an organization-wide policy defining acceptable and responsible AI use, roles, accountability, and approval pathways for deploying AI. The policy should cover elements such as AI definitions and applicability, risk tiers, acceptable and prohibited uses, accountable roles, approval and exception pathways, vendor expectations, education, monitoring and auditing of adherence, incident response, etc., and should connect AI governance to existing clinical, quality, safety, compliance, information-security, and enterprise-risk structures.',
  },
  {
    id: 'M02',
    name: 'AI Inventory & Use-Case Registry',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-04', 'tech-05', 'life-07'],
    description:
      'Maintain a catalog of AI systems across the enterprise — including proposed, procured, piloted, internally developed, vendor-supplied, changed, suspended, and retired systems — with their contexts of use, owners, risk ratings, and validation status and date. Inventory scope should extend well beyond clinical use to finance, revenue cycle, procurement, legal, HR, and other functions where AI is now ubiquitous.',
  },
  {
    id: 'M03',
    name: 'AI Literacy & Role-Based Training',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-02', 'life-04', 'life-09'],
    description:
      'Train staff and clinicians on AI capabilities, limitations, appropriate use, and bias awareness, with content tailored to role. Assess competency for safety-critical roles, provide refresher education after material system or workflow changes, and for clinical staff include recognizing specific limitations of AI-generated content in safety-critical contexts.',
  },
  {
    id: 'M11',
    name: 'Organizational Data Policy / Governance',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-04', 'tech-01', 'tech-05'],
    description:
      'Maintain policies governing data acquisition, retention, quality, and stewardship. For AI, ensure these policies explicitly address secondary use of data for model training or evaluation, vendor access to data, and retention of AI-generated artifacts (prompts, outputs, logs), so the AI governance policy (M01) can reference rather than duplicate them.',
  },
  {
    id: 'M20',
    name: 'Standard Operating Procedures for AI Use',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-04', 'life-01', 'tech-08', 'life-06'],
    description:
      'Maintain SOPs covering routine use, escalation, and response steps so staff can react when AI errs. Include an explicit escalation pathway for safety-critical scenarios (e.g., what to do in real time if an AI tool flags or misses risk) and ensure AI-related events and errors can be categorized and tracked in the organization\'s enterprise risk-management or safety-event reporting system.',
  },
  {
    id: 'M23',
    name: 'AI Risk Management Framework',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'life-04', 'life-07', 'tech-08'],
    description:
      'Maintain a structured framework (or policy) for AI risk management: pre-deployment risk assessment, risk classification, and periodic re-review of each AI use case. Set the re-review timeframe according to risk level — low-risk or standard-of-care uses may need monitoring rather than full re-review — and integrate the organization\'s risk-reporting system so AI safety events feed back into the assessment.',
  },
  {
    id: 'M24',
    name: 'AI Safety / Oversight Committee',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'life-07', 'tech-09'],
    description:
      'Maintain a cross-functional review board that reviews high-risk use cases and oversees safety decisions, with licensed clinical representation required. The committee may not be the final decision maker — adoption will also depend on cost, benefit, and operational impact — but it should own the safety and risk-mitigation recommendation and receive AI safety events from the organization\'s risk-reporting system.',
  },
  {
    id: 'M25',
    name: 'Vendor / Third-Party Risk Assessment',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-04', 'tech-05', 'tech-07', 'life-08'],
    description:
      'Assess external model and data suppliers for security, provenance, documentation, and contractual safeguards. Treat this as standard work and as an ongoing lifecycle control rather than a one-time procurement step — build periodic reassessment, performance and change notification, and termination clauses into vendor agreements.',
  },
  {
    id: 'M69',
    name: 'Safety Decision Framework / Go-No-Go Gates',
    appliesAt: ['High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-03', 'life-07', 'life-04'],
    description:
      'Define predefined criteria and stage gates to proceed, pause, or halt deployment based on risk evidence, including clinical safety thresholds as explicit criteria. Gates should be defined or adapted case by case according to the risk of the tool or process and may be unnecessary for low-risk applications.',
  },
  {
    id: 'M70',
    name: 'Clinical Governance Sign-off',
    appliesAt: ['High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-01', 'life-03', 'life-04'],
    description:
      'Appropriate clinical leadership (e.g., nursing leadership - CNO/CNIO - when the AI affects nursing practice or workflows) formally reviews and approves patient-facing or clinically integrated AI before go-live. Sign-off should reflect the affected disciplines, intended use, workflow, and level of patient risk, and be proportionate to that risk.',
  },
  {
    id: 'M14',
    name: 'Human-in-the-Loop Review (Assistive)',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-02', 'life-01', 'life-03'],
    description:
      'AI recommends; a qualified and accountable human reviews and makes the decision (assistive use). Review must be substantive rather than a nominal confirmation or checkbox — the reviewer needs sufficient time, information, competency, authority, and independent judgment — and the organization should define which inputs and outputs require review, recognizing that the appropriate level of human oversight (in-the-loop, on-the-loop, or verification step) varies by use case.',
  },
  {
    id: 'M51',
    name: 'Human-on-the-Loop Supervision (Augmentative)',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-02', 'life-05'],
    description:
      'AI executes within its defined scope while a human supervises with the ability to intervene. Supervision must be active, timely, and supported by defined intervention and escalation mechanisms, and this mode should not be used for high-acuity or crisis scenarios where a delayed intervention could cause harm.',
  },
  {
    id: 'M52',
    name: 'Human Verification or Approval Step',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-02', 'life-03', 'life-01'],
    description:
      'Require explicit human confirmation before a defined AI action takes effect. Specify which actions require approval based on regulatory requirements, organizational policy, and the consequence of the action — necessary for a clinical recommendation or an order, but not practical or appropriate for every embedded action in an integrated workflow.',
  },
  {
    id: 'M55',
    name: 'Clear Design (signal AI limits)',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-10', 'life-02'],
    description:
      'Design (as able) the user experience to present model limitations, confidence or uncertainty information, missing-data concerns, and situations in which clinical or professional judgment should supersede the AI recommendation, rather than presenting outputs as authoritative (an approach sometimes called \'seamful design\'). Consider this where the organization has influence over the interface; for third-party tools it is often a procurement requirement rather than something the health system builds.',
  },
  {
    id: 'M56',
    name: 'User Assessment / Fit-for-Use Screening',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-04', 'life-01'],
    description:
      'Define the intended-use criteria — which contexts, users, and patient populations the AI is appropriate for — and screen deployments against them. Assessment should focus on task fit, training, and workflow readiness, and must not exclude users or patients solely because of demographic characteristics or presumed capability.',
  },
  {
    id: 'M87',
    name: 'Human Override System',
    appliesAt: ['High'],
    domains: ['life-patient-safety'],
    modifiers: ['life-02', 'life-06', 'life-03'],
    description:
      'Provide a mechanism for a human to immediately override or stop AI actions. Scope it clearly: for some tools each user can override each action, while for others only a small number of authorized people can stop the system, and in interconnected environments the stop procedure must account for downstream effects on other systems.',
  },
  {
    id: 'M88',
    name: 'Provide Human Alternative',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-02', 'life-09', 'tech-10'],
    description:
      'Offer an accessible non-AI or human pathway for patients, members, or staff affected by an AI-influenced decision or service, where regulatory or organizational requirements or the nature of the use make it appropriate. This is not warranted for every use (e.g., an AI-drafted, clinician-reviewed patient message) and can be difficult at scale, so tie it to consequential, patient-facing, or autonomous uses.',
  },
  {
    id: 'M62',
    name: 'Incident Documentation & Reporting',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-09', 'life-03'],
    description:
      'Establish and maintain processes to document, investigate, escalate, and report AI-related incidents and near misses — including identified harms, contributing factors, corrective actions, and follow-up monitoring — mirroring the institution\'s existing incident reporting for other critical events. Adopt a simple, organization-wide definition of an \'AI incident\' with severity levels, distinguishing an AI error (e.g., a wrong output caught before use) from a downstream incident caused by an AI error (e.g., patient harm, billing error).',
  },
  {
    id: 'M95',
    name: 'Incident Detection & Response Plan',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-09', 'life-06', 'life-03'],
    description:
      'Define protocols to detect, classify, escalate, and mitigate AI incidents quickly, informed by regular monitoring and evaluation. Route events into the enterprise risk-reporting tool so categorization drives escalation path and response timeframe by severity, and treat this as a foundational governance area shared between Quality and IT.',
  },
  {
    id: 'M96',
    name: 'Incident Recovery & Business Continuity',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-06', 'life-08', 'tech-07'],
    description:
      'Maintain recovery and continuity plans so that when an AI system fails or must be shut down — including when a defined failure threshold is reached — clinical care and operations continue without impediment. For high-risk applications include AI-specific recovery procedures and manual workflows, and periodically exercise them the way disaster-recovery plans are exercised.',
  },
  {
    id: 'M15',
    name: 'Version Control & Configuration Management',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-08', 'life-08'],
    description:
      'Track model and configuration versions with auditable change management, so records identify who authorized each change, why it was made, when it was deployed, what validation was completed, and which version is currently in use. The rigor of change management should scale with the risk level assigned to the AI solution.',
  },
  {
    id: 'M16',
    name: 'Code Version Control',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-08'],
    description:
      'Maintain source control for all code with history and review — explicitly including prompts, system instructions, and other \'harness\' files, since a change to a prompt is a change to the system just like a code deploy. This mitigaion is feasible for internally developed AI. Externally developed AI may share information related to code versions upon request or per contractual requirements with the health system. For internally developed AI, include documented change histories, peer review, approval workflows, access controls, and rollback capability; for vendor-hosted systems, confirm the vendor tracks and controls prompt files somewhere.',
  },
  {
    id: 'M57',
    name: 'Model Lifecycle / MLOps Process',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-08'],
    description:
      'Establish and maintain a documented, repeatable process for the design, development or acquisition, validation, approval, deployment, monitoring, modification, and retirement of AI systems, with defined governance at each stage. Involve IT or the enterprise digital-services group where they share monitoring and management responsibilities, and reference the team\'s existing repository or documentation rather than duplicating it here.',
  },
  {
    id: 'M58',
    name: 'Model Retraining & Refresh Cadence',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-08', 'tech-04', 'life-05'],
    description:
      'Establish criteria and controlled processes for model retesting and, when indicated, retraining, updating, or recalibration — triggered by performance monitoring, data drift, or changes in clinical practice, population, or intended use. Refresh frequency is risk-based and model-specific (not every model needs scheduled retraining); updates may need revalidation, approval, version control, rollback readiness, cybersecurity review (unless a predetermined change control plan applies), and post-update monitoring, and for third-party hosted models the health system cannot retrain, the same pattern can apply as a regular revalidation workflow.',
  },
  {
    id: 'M59',
    name: 'Model Tracking System',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-08', 'life-05'],
    description:
      'Maintain a central registry tracking model versions, lineage, and deployment status — extended beyond in-house models to vendor-developed and generative AI systems — that supports traceability, change management, monitoring, incident response, and identification of the specific version deployed in each clinical or operational setting. IT and cybersecurity should have access to it.',
  },
  {
    id: 'M90',
    name: 'Staged / Canary Deployment',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-07', 'tech-08', 'life-08'],
    description:
      'Where appropriate, roll out updates gradually (canary or staged) to limit blast radius and detect unexpected behavior before full-scale deployment. Staged rollout is not always the right choice — an update that fixes a known deficiency or liability may need to be deployed system-wide at once — so the decision should be based on the risk and complexity of the change.',
  },
  {
    id: 'M91',
    name: 'Rollback Capability',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-08', 'life-06', 'life-07'],
    description:
      'Maintain the ability to promptly revert an AI system, model, configuration, or update to a previously validated and approved state when performance, safety, security, or operational issues are identified. Where no prior model exists to revert to, the fallback is a known standard-of-care or operating procedure that users have been trained on, and cybersecurity should be notified when a rollback is executed.',
  },
  {
    id: 'M12',
    name: 'Structured Inputs & Outputs',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-02', 'life-03'],
    description:
      'Use standardized, structured input and output formats where feasible — required fields, controlled vocabularies, defined data types, standardized response schemas, allowable value ranges — to reduce ambiguity, support validation, and limit interpretation errors. Address handling of missing or invalid data and acknowledge that unstructured or multimodal inputs remain clinically or operationally necessary for many use cases, in which case the variability should be assessed rather than assumed constrainable.',
  },
  {
    id: 'M13',
    name: 'System Prompt / Behavioral Constraints',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-07'],
    description:
      'Define, test, document, and maintain system-level instructions and behavioral constraints that limit AI actions and outputs to the intended use, authorized scope, and applicable safety requirements (e.g., preventing unsupported diagnoses or treatment recommendations when not authorized). Distinguish probabilistic system-prompt instructions from deterministic guardrails — inference constraints, decision thresholds, business rules, and output validation — and do not treat prompt \'nudges\' as equivalent to enforced controls.',
  },
  {
    id: 'M43',
    name: 'Performance Requirements & Acceptance Thresholds',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-06', 'life-04'],
    description:
      'Define and document minimum performance, safety, and acceptance criteria for the AI system based on its intended use, target population, clinical or operational context, and potential level of harm. Thresholds may include accuracy, sensitivity, specificity, calibration (e.g., ROC/AUC for predictive models), reliability, fairness, usability, and workflow performance; set them with the clinical leadership relevant to the applied environment (e.g., nursing leadership for nursing workflows, medical leadership for physician workflows), evaluate on representative data, and reassess when the model, population, workflow, or intended use changes.',
  },
  {
    id: 'M44',
    name: 'Input Checks / Guardrails',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-07', 'life-03', 'tech-02'],
    description:
      'Implement and test input validation and guardrails to identify, reject, sanitize, or appropriately route malformed, incomplete, out-of-scope, unsafe, unauthorized, or adversarial inputs before they are processed by the AI system, and monitor them on an ongoing basis. This is increasingly challenged by users attempting to outsmart LLM-based tools, so guardrails need periodic retesting (see M97, M86).',
  },
  {
    id: 'M45',
    name: 'Output Checks / Validation Guardrails',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-09', 'tech-10'],
    description:
      'Validate outputs against rules and limits before they reach users or downstream systems. This is both a pre-deployment validation (outputs meet a defined accuracy or validation score) and an ongoing runtime control with periodic auditing, since one-time validation does not detect later degradation.',
  },
  {
    id: 'M46',
    name: 'Explainable Models',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-10', 'life-09', 'life-02'],
    description:
      'Prefer interpretable models or validated explanation methods, when appropriate to the intended use and risk level, so decisions can be understood, reviewed, and audited. LLM-generated \'reasoning\' text does not constitute explainability; where a model is inherently a black box, education and training on its limitations (M03) and stronger validation (M81) are the compensating mitigations.',
  },
  {
    id: 'M47',
    name: 'Retrieval-Augmented Generation',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-04'],
    description:
      'Ground generative outputs in trusted, current source documents to reduce error, with governance over the retrieval sources — provenance, access controls, document currency, retrieval quality, citation or source attribution, and testing for incomplete, conflicting, or irrelevant retrieved content. Establish a scheduled cadence to review and refresh grounding sources, and do not rely on RAG as the sole safeguard against unsupported or inaccurate outputs.',
  },
  {
    id: 'M49',
    name: 'Content Safety Controls / Filters',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-07', 'life-09'],
    description:
      'Implement, test, and monitor content safety controls to identify, block, flag, or appropriately route unsafe, harmful, prohibited, or noncompliant content in AI inputs and outputs. \'Noncompliant\' should be defined against a specific organizational policy or reference (e.g., prohibited topics, protected categories, regulated advice) for the filter to be meaningful.',
  },
  {
    id: 'M50',
    name: 'Model Hyperparameter Controls',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-08', 'life-03'],
    description:
      'Govern and document model configuration and hyperparameters affecting safety and reliability, with human review and approval required before configuration changes take effect in production. Include MLOps, and for higher-risk tools clinical leadership or AI Governance, in the review.',
  },
  {
    id: 'M81',
    name: 'Pre-deployment Validation & Clinical Evaluation',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'life-04', 'tech-06', 'tech-05'],
    description:
      'Conduct rigorous validation — independent of model development where feasible and proportionate to the system\'s risk and intended use, including clinical evaluation — before deployment, especially when data transparency is limited. Clarify per use case whether the expectation is an internal local validation, reliance on an independent external validation (e.g., a published study), or both; higher-risk tools generally warrant local validation on the deploying organization\'s population.',
  },
  {
    id: 'M83',
    name: 'Hallucination Detection Guardrails',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-09'],
    description:
      'Implement and test controls to identify, flag, block, or route potentially fabricated, unsupported, or source-inconsistent generative AI outputs before they are used in clinical or operational workflows, and measure and track hallucination rates over time. Complete \'suppression\' is not technically achievable, so combine evidence-retrieval mechanisms (M47), validation checks (M45), and monitoring, and link outputs that result in harm to incident reporting (M62).',
  },
  {
    id: 'M84',
    name: 'Secondary / Verification Models',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-09'],
    description:
      'Use an independent model or agent to cross-check or verify primary model outputs, as an optional, risk-based validation technique that does not by itself establish an output is correct. Where technically feasible, consensus approaches across multiple agents or models can be used, with humans overseeing the verification layer.',
  },
  {
    id: 'M85',
    name: 'Ensemble Model Methods',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-06'],
    description:
      'Combine multiple models to improve robustness and reduce single-model error, while assessing the ensemble as a system. Multiple models used in concert can have higher or less predictable error rates and compounded failure modes, so the combined system — not only its components — requires validation and monitoring.',
  },
  {
    id: 'M17',
    name: 'Audit Logs / Audit Trails',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-10', 'tech-09', 'tech-07', 'life-05'],
    description:
      'Maintain detailed, tamper-resistant records of user actions, system changes, model inputs and outputs, AI outputs or actions, human overrides, and automated actions — including unique identities for AI agents — to enable traceability, investigation, and accountability. Logging depth should be risk-based, capturing enough detail to understand what happened if there is an issue, and the split of logging between a vendor-hosted backend and the health-system environment should be defined (some vendor system changes may legitimately not be shared with customers).',
  },
  {
    id: 'M60',
    name: 'Performance & Drift Monitoring',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-05', 'tech-09', 'tech-06'],
    description:
      'Monitor performance and detect data and concept drift over time, treating performance monitoring (which depends on ground-truth availability) and drift monitoring (inputs and outputs separately) as related but distinct activities. Extend monitoring beyond technical metrics to clinical performance, safety, workflow impact, and performance across relevant populations; use event-driven triggers (EHR upgrades, vendor changes, new sites) as well as periodic cadence, since clinical drift is often abrupt; scale metrics and frequency to the use case and risk level; and name a clinical owner who decides whether observed change is clinically meaningful and whether to suspend the model.',
  },
  {
    id: 'M61',
    name: 'Model Monitoring System',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-09', 'life-05'],
    description:
      'Deploy tooling — often itself an AI-enabled monitoring tool — that tracks model behavior and surfaces anomalies for review, including changes or patterns that may indicate degraded performance, safety concerns, workflow disruption, or unintended effects on users or patient populations. The tooling should be configured to implement the monitoring practices in M60; having a monitoring system in place is not the same as monitoring actually being performed.',
  },
  {
    id: 'M92',
    name: 'Real-Time / Continuous Monitoring',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-05', 'tech-09', 'life-06'],
    description:
      'For higher-risk or time-sensitive use cases, embed real-time or near-real-time monitoring of system performance, security, and emergent issues — including anomalous behavior, unauthorized access, data leakage, prompt injection, model misuse, and unexpected or unsafe AI outputs — integrated into existing IT and security monitoring rather than run as a separate function. Not every AI solution requires continuous monitoring; the cadence (continuous, near-real-time, or periodic snapshots) should be risk-proportionate and defined per use case, and it should be clear whether detection triggers automated action, a safe mode, or human review.',
  },
  {
    id: 'M93',
    name: 'Runtime Data-Integrity Monitoring',
    appliesAt: ['High'],
    domains: ['technology-data'],
    modifiers: ['tech-09', 'tech-02', 'tech-01', 'tech-04'],
    description:
      'Detect data poisoning, anomalous or unauthorized ingestion, stale or degraded data feeds, and integrity breaches at runtime to ensure the AI operates on trusted, accurate, and reliable data. This applies chiefly when the AI depends on live or frequently changing data feeds and can be implemented as part of general model and data-pipeline monitoring rather than as a standalone program.',
  },
  {
    id: 'M94',
    name: 'Anomaly Alerting with Severity Tiers',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-09', 'life-06', 'life-05'],
    description:
      'Provide automated detection and triage of abnormal model behavior with severity-tiered alerts and clear escalation paths integrated with safety and IT incident workflows. Automatic suspension of a system should be used only when stopping it would not create a larger patient-safety or operational risk than continuing.',
  },
  {
    id: 'M53',
    name: 'User Consent',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-10', 'tech-01', 'life-09'],
    description:
      'Provide risk- and context-based consent for individuals (patients or members — not internal users) before AI is applied to them, stratified by the AI\'s autonomy and clinical relevance: notification for low-risk uses with a human in the loop (e.g., documentation support), and explicit informed consent for autonomous or minimally supervised, patient-facing, care-influencing, or sensitive-data uses. Separate AI-specific consent is not a blanket requirement — it may be infeasible (e.g., emergent care, AI embedded in standard care such as imaging) or irrelevant (back-office finance), is often handled through consent-to-treat and privacy-notice documents, and should be driven by applicable regulation.',
  },
  {
    id: 'M54',
    name: 'Feedback Mechanisms & Stakeholder Participation',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-09', 'tech-10', 'life-04'],
    description:
      'Provide channels for users, patients, and stakeholders to report problems, concerns, and suggestions for improvement, and document how concerns are reviewed, escalated, resolved, and incorporated into system improvement. Each organization should define these mechanisms and educate users about them; Patient and Family Advisory Councils (PFACs) are a recommended format for structured stakeholder participation alongside surveys and in-product feedback.',
  },
  {
    id: 'M77',
    name: 'Collect Diverse & Representative Training Data',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-06', 'life-09'],
    description:
      'Deliberately assemble — or, for vendor models the health system does not train, obtain sufficient evidence about — training data that covers the populations, settings, and subgroups of the intended use and deployment setting, kept separate from validation data. Representativeness should be assessed relative to the intended use, deployment setting, and populations affected rather than in the abstract.',
  },
  {
    id: 'M78',
    name: 'Subgroup Coverage & Representativeness Analysis',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-06', 'life-09'],
    description:
      'Quantify coverage and performance across subgroups to expose generalizability gaps, focusing on the clinically meaningful and potentially underrepresented populations relevant to the intended use and deployment setting. Allow for cases where sample size or data availability limits the analysis, and document those limits rather than omitting the analysis.',
  },
  {
    id: 'M35',
    name: 'Minimize AI System Access / Privileges',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-07', 'life-08'],
    description:
      'Apply least-privilege, least-functionality, data-minimization, and defense-in-depth controls to limit the AI system\'s own permissions, access, and ability to take actions across connected systems, so that it has only the minimum necessary rights to perform its specific functions and the impact of unauthorized or unintended behavior is reduced. Access is determined by role and use case and will vary; this is especially important for agentic AI given documented sandbox escapes and unintended actions.',
  },
  {
    id: 'M48',
    name: 'Rate-Limiting of System Inputs',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-07', 'life-07', 'life-06'],
    description:
      'Throttle request volume to limit abuse, runaway automation, and cascade speed where the AI can operate at scale, call other systems, or create downstream effects. Consider a gatekeeper process in which IT/Platform Engineering reviews unusually high usage (e.g., token consumption) and can permit or shut down further AI activity, recognizing that some legitimate complex processes require high usage.',
  },
  {
    id: 'M63',
    name: 'Vulnerability Scanning',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-07', 'tech-08'],
    description:
      'Regularly scan the AI stack for known security vulnerabilities, misconfigurations, and emerging threats. \'Known vulnerabilities\' means publicly catalogued weaknesses (e.g., CVEs, OWASP LLM/ML risk categories) as well as issues previously identified in the organization\'s own environment.',
  },
  {
    id: 'M74',
    name: 'Model Encryption',
    appliesAt: ['High'],
    domains: ['technology-data'],
    modifiers: ['tech-07'],
    description:
      'Encrypt model weights, artifacts, and other sensitive AI assets at rest and in transit using modern encryption standards (which may include quantum-resistant cryptography where appropriate) to prevent unauthorized access, theft, tampering, or misuse. Most relevant where the organization hosts or fine-tunes models itself; for vendor-hosted models, verify through the vendor assessment.',
  },
  {
    id: 'M75',
    name: 'Restricted Development Environment',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-07', 'tech-08', 'life-08'],
    description:
      'Develop and train AI systems in hardened, access-controlled environments isolated from production, with appropriate network segmentation, identity controls, and protections against unauthorized access or tampering. This applies directly to internally developed AI; for vendor solutions, organizations rely on vendor controls and third-party assurance (e.g., SOC 2, HITRUST) rather than managing the environment.',
  },
  {
    id: 'M86',
    name: 'Prompt Boundary Defenses',
    appliesAt: ['High'],
    domains: ['technology-data'],
    modifiers: ['tech-07'],
    description:
      'Defend against prompt injection and boundary-evasion attacks in LLM- and prompt-based systems, treating any external or retrieved content (documents, web pages, messages, tool outputs) as untrusted input that must not be able to override system instructions. Retest defenses when models, prompts, or retrieval sources change.',
  },
  {
    id: 'M97',
    name: 'Red-Team / Adversarial Testing',
    appliesAt: ['High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-07', 'tech-09', 'life-03', 'life-09'],
    description:
      'Conduct risk-based adversarial testing to surface safety, misuse, security, and bias failures before deployment and after major changes, with more rigorous testing for higher-impact AI. Testing should cover clinical safety and misuse scenarios (e.g., off-topic, override, and safety-sensitive prompts), not only cybersecurity, and can be scaled to the organization\'s capabilities through internal teams, vendors, or third-party services.',
  },
  {
    id: 'M98',
    name: 'Penetration Testing',
    appliesAt: ['High'],
    domains: ['technology-data'],
    modifiers: ['tech-07'],
    description:
      'Conduct regular security testing of the AI deployment surface — infrastructure, APIs, integrations, and identity and access controls — to identify exploitable weaknesses and validate that controls withstand realistic attack scenarios. Testing may include internal or third-party penetration testing, automated testing, and other adversarial security assessments appropriate to the organization\'s capabilities and risk profile, prioritized for externally facing or highly integrated AI systems rather than required for every use case.',
  },
  {
    id: 'M19',
    name: 'Unit Tests',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-08'],
    description:
      'Maintain automated tests that check critical logic and edge cases, run automatically each time the underlying code changes so problems are caught before the tool reaches patients or staff. For vendor solutions, tests must be developed in partnership with the vendor so they match the system\'s expected output, may change over time with design decisions, and should have their results reviewed by a human for accuracy.',
  },
  {
    id: 'M66',
    name: 'Manual QA',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-02'],
    description:
      'Conduct human quality assurance of outputs and end-to-end workflows before and during use, with domain reviewers — including clinicians when outputs could affect care or patient safety — spot-checking a formally defined sample of cases. Define the sampling approach (sample size, selection method, frequency, and depth) in advance and scale it to risk and intended use; at scale, sampling may be triggered by automated flagging of outliers rather than fully manual selection, since simple unstructured perusal is a weak test except for highly deterministic or narrow tasks.',
  },
  {
    id: 'M67',
    name: 'Multiple Annotators for Labels',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-02', 'life-09', 'tech-06'],
    description:
      'For medium- and high-risk tools, use multiple annotators with agreement checks to improve label quality and reduce bias, tracking inter-rater reliability and adjudicating disagreements so systematic blind spots in the ground truth surface early. Inter-rater variability is itself an important measure of whether a reliable ground truth exists for the task, and the practice is resource-intensive, so reserve it for higher-risk applications.',
  },
  {
    id: 'M68',
    name: 'Performance Benchmarking Against Standards',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-03', 'tech-06'],
    description:
      'Benchmark model and solution performance against carefully defined, recognized standards or baselines — including the current standard of care or the pre-AI workflow it replaces — stratified across the patient subgroups the solution will serve. Standards should be selected with clinical, quality, and governance stakeholders so they align with recognized bodies (e.g., accreditation and quality agencies), recognizing that passing a benchmark does not by itself ensure risk is mitigated.',
  },
  {
    id: 'M08',
    name: 'Risk Disclosure & Intended-Use Statement',
    appliesAt: ['Low', 'Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['life-04', 'tech-05', 'life-07'],
    description:
      'Share intended use, known limitations, and residual risks of the AI solution with deployers and users, stating explicitly which populations and settings it was not validated for so out-of-scope use is recognizable. Where feasible, pair disclosure with technical or workflow constraints that prevent use in populations or settings for which the solution was not validated, and define \'residual risk\' at the deployment level as the risks that remain after the organization\'s mitigations are applied.',
  },
  {
    id: 'M27',
    name: 'Output Labeling & Watermarking of AI Content',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-10', 'life-02'],
    description:
      'Clearly label AI-generated outputs (human-facing and machine-to-machine) so AI involvement is detectable, and persist that provenance downstream — into the chart, message, or exported record — so it survives copy-forward. Distinguish output labeling and provenance metadata (e.g., a note attribute or header stating AI-drafted and clinician-reviewed) from watermarking, which may not be feasible or reliable for all content, and consider unintended consequences such as labeled content being inappropriately discounted in later review.',
  },
  {
    id: 'M28',
    name: 'Explanations for System Outputs',
    appliesAt: ['Medium', 'High'],
    domains: ['life-patient-safety', 'technology-data'],
    modifiers: ['tech-10', 'life-02', 'life-09'],
    description:
      'Provide understandable rationale for AI outputs — appropriate to the user and intended use — so users can judge, override, correct, and contest them, surfacing the key contributing factors, sources used, and confidence at the point of decision. Distinguish true model explainability from post hoc or generated rationales; for complex LLMs a full trace of logic is generally not feasible, and a trace of sources used is the practical expectation.',
  },
  {
    id: 'M42',
    name: 'Verify Data & Model Sources',
    appliesAt: ['Medium', 'High'],
    domains: ['technology-data'],
    modifiers: ['tech-04', 'tech-05', 'tech-06'],
    description:
      'Confirm the reputability and provenance of data and model sources before use, documenting licensing, collection context, and version history to the extent obtainable so the supply chain can be re-audited when a model or dataset is updated. Apply proportionately: a vendor may not be able to share all background context, provenance of frontier-model training content is often unknowable, and version churn is rapid, so focus on what is material to risk (source reputability, intended-use fit, and change notification) rather than exhaustive audit.',
  },
]

export const MITIGATION_BY_ID: Record<string, Mitigation> = Object.fromEntries(
  MITIGATIONS.map((m) => [m.id, m]),
)
