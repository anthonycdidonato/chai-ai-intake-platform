// ---------------------------------------------------------------------------
// CHAI Risk Categorization Tool (v3) — source content
//
// Transcribed from the Coalition for Health AI (CHAI) "Risk Categorization
// Tool" User Guide, June 2026. Two primary risk domains, each with a set of
// independently scored risk modifiers. Each modifier is scored Low, Medium,
// or High (or N/A / Need More Info).
// ---------------------------------------------------------------------------

export type RiskLevel = 'Low' | 'Medium' | 'High'
export type ResponseValue = 'Low' | 'Medium' | 'High' | 'N/A' | 'Need More Info'

export interface RiskModifier {
  /** Two-digit ordinal within its domain, e.g. "01" */
  number: string
  /** Stable id, e.g. "life-01" */
  id: string
  title: string
  /** What the modifier evaluates */
  description: string
  definitions: Record<RiskLevel, string>
}

export interface RiskDomain {
  id: string
  name: string
  /** Short blurb describing the domain */
  blurb: string
  modifiers: RiskModifier[]
}

export const PRIMARY_AUDIENCE =
  'Health systems (any size) and teams responsible for pre-deployment risk review'

export const RESPONSE_OPTIONS: ResponseValue[] = [
  'Low',
  'Medium',
  'High',
  'N/A',
  'Need More Info',
]

/** Standard organizational actions keyed to a response level. */
export const ACTIONS: Record<ResponseValue, string> = {
  Low: 'Apply organizational low risk mitigation controls',
  Medium: 'Apply organizational medium risk mitigation controls',
  High: 'Apply organizational high risk mitigation controls (a rigorous risk assessment is strongly recommended)',
  'N/A': 'Not applicable to this use case',
  'Need More Info': 'Gather additional information before categorizing',
}

export const DOMAINS: RiskDomain[] = [
  {
    id: 'life-patient-safety',
    name: 'Life & Patient Safety',
    blurb:
      'Risks related to the life or safety of a patient or group.',
    modifiers: [
      {
        number: '01',
        id: 'life-01',
        title: 'Distance From Patient',
        description:
          'How physically or operationally close the AI solution is to the patient.',
        definitions: {
          Low: 'No direct impact on individual patient care, support back-end functions such as back office administrative tasks, population health analysis, or workflow optimization.',
          Medium:
            'Indirect impact on patient care, access to care, or informational use, such as scheduling, transportation, non-clinical informational chatbots.',
          High: 'AI solution has semi-direct involvement in patient care; such as, used by a healthcare professional as part of a broader clinical judgment; AI solution is directly involved in patient care/patient interaction.',
        },
      },
      {
        number: '02',
        id: 'life-02',
        title: 'Decision Autonomy',
        description:
          "The extent to which the AI holds independent decision-making authority relative to a human, and therefore how much human judgment stands between the AI's output and a real-world action.",
        definitions: {
          Low: 'Assistive: Human decides. The AI informs or recommends; a human reviews and makes the decision. Risk is entirely on the human reviewer.',
          Medium:
            'Augmentative: Human supervises. The AI executes within a defined scope; a human is on the loop with the ability to intervene or override. Risk depends on whether oversight is meaningful (clinician has time, context, and authority to override) or nominal (rubber-stamping).',
          High: 'Autonomous: AI decides. The AI makes and acts on the decision without case-by-case human review. Risk shifts almost entirely to the AI system, its validation, and its ongoing monitoring.',
        },
      },
      {
        number: '03',
        id: 'life-03',
        title: 'Consequences Of Failure Or Error If AI Output Is Incorrect',
        description:
          'Assuming the AI produces an incorrect output that contributes to a negative outcome, what is the worst-case severity of patient harm that could result? Clinical outcomes are higher risk.',
        definitions: {
          Low: 'AI solution has no direct impact. An incorrect output cannot meaningfully harm a patient.',
          Medium:
            'An incorrect output may lead to temporary discomfort or inconvenience, with no lasting health effects (e.g., minor delays in care). An incorrect output may result in temporary or reversible harm that requires medical intervention (e.g., prescribing the wrong medication dose that requires monitoring but no lasting injury).',
          High: 'An incorrect output may lead to permanent harm, permanent damage to body structure, disability, or death (e.g., critical diagnostic imaging misinterpreted, missed sepsis).',
        },
      },
      {
        number: '04',
        id: 'life-04',
        title: 'Use Context And Complexity',
        description:
          "The risk introduced by the setting in which the AI is used (e.g., administrative/back office, outpatient, inpatient, ED) or the complexity of the primary patient population impacted. Note that both the criticality of the use context and the complexity of the patient population can impact a user's time and cognitive resources to review outputs, catch errors, etc.",
        definitions: {
          Low: 'AI solution is used in non-critical settings (e.g., outpatient or back-office support) and/or primarily on patients who are non-complex and stable (e.g. patients coming for routine annual visit).',
          Medium:
            'AI solution used in inpatient or urgent (non-life-critical) settings, and/or used primarily with patients who are medically complex, but stable (e.g. patients with multiple chronic conditions, but who are stable on medication, and being seen by primary care physician).',
          High: 'AI solution used in life-critical or emergency settings and/or primarily used with patients who are medically complex or unstable (e.g. patient with heart failure that is not stable on medications).',
        },
      },
      {
        number: '05',
        id: 'life-05',
        title: 'Level Of Difficulty Monitoring AI Solution Output',
        description:
          "How robust is the AI solution's monitoring capabilities? How resource intensive will the AI solution be to monitor output and performance? Depends on both the AI solution provider and health system capabilities.",
        definitions: {
          Low: 'Embedded real-time monitoring and/or capability of real-time monitoring.',
          Medium:
            'AI solution includes partial real-time monitoring capabilities; health system still requires partial development of monitoring capabilities; periodic reports.',
          High: 'Monitoring needs to be developed before implementation of solution; and/or manual monitoring that requires resource intensive activities.',
        },
      },
      {
        number: '06',
        id: 'life-06',
        title: 'React Time',
        description:
          'Assuming the AI output is incorrect, how quickly a decision or intervention can be made.',
        definitions: {
          Low: 'There will be time for reaction and response planning before serious consequences of the risk.',
          Medium:
            'There will be limited time for reaction and response planning before serious consequences of the risk.',
          High: 'There will be very little or no time for reaction and response planning before serious consequences of the risk.',
        },
      },
      {
        number: '07',
        id: 'life-07',
        title: 'Breadth Of Potential Harm',
        description:
          'The breadth of potential harm the AI solution could cause to patients if it performs incorrectly; assess how broadly the AI solution is deployed across locations or institutions.',
        definitions: {
          Low: 'Affects a single individual or a small number of patients in a limited number of settings (e.g., rare disease diagnostics, single-department pilot, one site, one clinic, or limited geographical area).',
          Medium:
            'Affects a moderate number of patients (e.g., roughly half of patient population), possibly across multiple units or clinics (e.g., diabetes prediction across outpatient clinics).',
          High: 'Potential for widespread harm—across facilities, populations, or entire health systems (e.g., enterprise-wide triage algorithm, regional EMS AI for trauma prioritization).',
        },
      },
      {
        number: '08',
        id: 'life-08',
        title: 'Cross-System Propagation Risk',
        description:
          'The degree to which an incorrect AI output (or unavailability of the AI service) can propagate across integrated systems and workflows, magnifying its downstream impact. "Propagation" means technical and operational cascade across systems.',
        definitions: {
          Low: 'AI solution is functionally isolated, with minimal integration into other digital systems or workflows. An incorrect output is unlikely to spread beyond the immediate user or use case.',
          Medium:
            'AI solution is integrated into specific modules or workflows but has limited cross-functional connections. An incorrect output could affect related components but is unlikely to cause widespread disruption.',
          High: 'AI solution is deeply embedded across multiple systems and workflows. Its outputs are widely relied upon and shared, increasing the chance that a single point of failure could cascade across care settings, decisions, or resource allocations.',
        },
      },
      {
        number: '09',
        id: 'life-09',
        title: 'Population Sensitivity Or Disparity Risk',
        description:
          'The risk that the AI solution could exacerbate health disparities or biases affecting sensitive populations based on race, gender, SES, etc.',
        definitions: {
          Low: "There is minimal to no risk of the AI solution's output contributing to health disparities.",
          Medium:
            'There is risk of the AI solution contributing to health disparities, especially if mitigation strategies are not implemented effectively or continuously evaluated.',
          High: 'There could be significant risk of contributing to health disparities, such as high potential to cause harm through unequal diagnosis, treatment, or outcomes; the system could reinforce or worsen existing healthcare inequities, especially for vulnerable groups.',
        },
      },
    ],
  },
  {
    id: 'technology-data',
    name: 'Technology & Data',
    blurb:
      'Flaws, failures, vulnerabilities, or technical complexities related to AI systems, privacy or cybersecurity (confidentiality, integrity, and availability).',
    modifiers: [
      {
        number: '01',
        id: 'tech-01',
        title: 'Use Of Sensitive Data',
        description:
          'The degree of risk depends on whether AI solutions rely on synthetic or Expert-Determined data (low risk), HIPAA Safe Harbor de-identified data with residual re-identification potential (medium risk), or identified PII/PHI directly exposed during use (high risk).',
        definitions: {
          Low: 'Only synthetic, nonconfidential, or nonproprietary data — or data de-identified under Expert Determination (per HIPAA) — are used. No individually identifiable elements are present, and privacy or re-identification risks are minimal (residual risk as determined by expert statistical analyses), making residual confidentiality risk low.',
          Medium:
            'Data are de-identified following HIPAA Safe Harbor standards, with direct identifiers removed but some residual re-identification risk remaining (e.g., through data linkage), or falls under a HIPAA exception. While confidentiality risks are reduced, technical and organizational safeguards are still needed to maintain integrity and prevent unintended disclosures. Unlike Expert Determination, Safe Harbor does not provide statistical proof of minimal risk.',
          High: 'Data contain personally identifiable information (PII), protected health information (PHI), or other confidential or proprietary content and does not fall under a HIPAA exception. Identifiers or sensitive elements are directly available to systems or vendors, creating elevated confidentiality and privacy risks if safeguards fail.',
        },
      },
      {
        number: '02',
        id: 'tech-02',
        title: 'Accuracy Of Data',
        description:
          'How correct, valid, and conformant are the values in the training and operational data? This modifier addresses semantic validation, identifier consistency, deduplication, and conformance to coding standards and ontologies (e.g., ICD, SNOMED, LOINC, FHIR).',
        definitions: {
          Low: 'Values are subject to automated validation (e.g., range or semantic checks, deduplication). When appropriate, data are standardized to common formats or ontologies (e.g., ICD, SNOMED, LOINC, FHIR), ensuring consistent, correctly coded values.',
          Medium:
            'Sources are generally reliable, but coding practices may be inconsistent across sites, with only partial mapping to standards. Mitigation measures (e.g., cross-checks, reconciliation against reference datasets) are applied, though confidence in value-level correctness is reduced.',
          High: 'Quality defects such as unvalidated values and inconsistent identifiers frequently enter the pipeline. Data are stored in proprietary formats with little or no harmonization, even when appropriate, posing significant risks to the reliability of downstream AI outputs.',
        },
      },
      {
        number: '03',
        id: 'tech-03',
        title: 'Completeness Of Data',
        description:
          'How complete is the data? This modifier addresses missingness, field population, duplication and fragmentation, and coverage relative to the intended population.',
        definitions: {
          Low: 'Sources are subject to automated integrity checks for missingness and duplication. Fields are well-populated and coverage is sufficient for the intended use, with little risk of gaps or fragmentation.',
          Medium:
            'Gaps in completeness exist, such as incomplete fields or partial coverage, but mitigation measures (e.g., imputation, reconciliation against reference datasets) are applied. While usable, confidence is reduced compared to highly complete sources.',
          High: 'Quality defects such as high missingness frequently enter the pipeline, and data are fragmented across sources, posing significant risks to the reliability of downstream AI outputs.',
        },
      },
      {
        number: '04',
        id: 'tech-04',
        title: 'Veracity Of Data',
        description:
          'How truthful, trustworthy, and current are the data sources and pipelines? This modifier addresses source reputability and provenance, governance and oversight, and freshness/refresh cadence.',
        definitions: {
          Low: 'Training data come from highly reputable and trusted sources (e.g., well-established health systems, certified registries, national datasets). Provenance is clear, and update frequency keeps data current, with little risk of corruption or degradation.',
          Medium:
            'Training data originate from sources that are generally reputable but may have known limitations or variability (e.g., vendor-managed datasets, multi-site extracts), including lagged refresh cycles. While usable, confidence in long-term veracity and timeliness is reduced compared to highly reputable sources.',
          High: 'Training data are drawn from unreliable, poorly governed, or opaque sources (e.g., siloed local systems with little oversight, proprietary vendor datasets with unclear provenance, or ad-hoc data pulls). Data are stale or outdated, posing significant risks to the reliability of downstream AI outputs.',
        },
      },
      {
        number: '05',
        id: 'tech-05',
        title: 'Data Transparency',
        description:
          'The clarity, completeness, and accessibility of information about the data sources and datasets used to train, test, and validate the AI solution.',
        definitions: {
          Low: 'Health system has complete information about the data sources and datasets used to train, test, and validate the underlying model(s); detailed documentation (e.g., data provenance and a data catalog/dictionary) is shared and available (e.g., AI solution developed internally).',
          Medium:
            'Health system has partial information about the data sources and datasets used to train, test, and validate the underlying model(s); some documentation about the data/datasets is shared and available.',
          High: 'Health system has no information about the data sources and datasets used to train, test, and validate the underlying model(s); no documentation about the data/datasets is shared or available (e.g., data provenance and data catalog/dictionary unavailable).',
        },
      },
      {
        number: '06',
        id: 'tech-06',
        title:
          'Sufficiency And Representativeness Of Data Used For AI Model Training And Operation',
        description:
          'How well do the training and operational data cover the populations, settings, and subgroups the AI will encounter in deployment? Note: Bias is often unavoidable; transparency is important to help organizations determine appropriate mitigation steps (e.g., tuning with more representative data, training staff for limited/cautious use).',
        definitions: {
          Low: 'Data are large, longitudinal, and representative of the population in which it will be used across key variables and subgroups.',
          Medium:
            'Data are adequate for the primary population but have limitations in depth (e.g., no historical patient data captured) or breadth (e.g., few sites, missing subgroups).',
          High: 'Data are small, narrow in scope, or lack population representativeness. There is a significant risk of poor generalizability.',
        },
      },
      {
        number: '07',
        id: 'tech-07',
        title: 'AI Model Security Vulnerabilities For Technology',
        description:
          'The extent to which an AI model is exposed to security risks based on its technical deployment surface (application-bound, internal, or internet-facing).',
        definitions: {
          Low: 'The model operates only within the application boundary, with no external interfaces or integrations, minimizing exposure to external threats. The isolated, self-contained design provides high resiliency and assured business continuity (e.g., the application continues to function even if external networks are disrupted).',
          Medium:
            "The model is internal-facing (accessible within the organization's network), where exposure to insider threats or lateral movement attacks is possible if security controls are weak. The deployment has moderate resiliency and business continuity, as operations depend on the stability of the internal network and safeguards (e.g., if the hospital intranet fails, AI services are disrupted but external systems remain unaffected).",
          High: 'The model is internet-facing, exposed to external networks, making it a target for adversarial inputs, denial-of-service attempts, or unauthorized access. The deployment has low resiliency and business continuity, as disruptions or compromises could cascade widely across users and systems (e.g., an outage of the internet-facing service could halt critical clinical workflows across multiple sites).',
        },
      },
      {
        number: '08',
        id: 'tech-08',
        title: 'AI Model Lifecycle Management And Updates',
        description:
          'How effectively the AI model is designed, developed, retrained, validated, version-controlled, and deployed across its lifecycle. This includes (a) the model lifecycle governance and (b) the data handling regime that drives lifecycle risk.',
        definitions: {
          Low: 'AI models follow a documented lifecycle for design, retraining, validation, and controlled deployment of updates. Configuration management and version control are fully automated and auditable, with clear rollback and approval steps. For example, model updates are versioned, tested, staged (e.g., canary deployment), validated, and have rollback capability. Or, model training is static or performed in a tightly controlled, validated pipeline outside production, reducing the risk of data poisoning or integrity loss.',
          Medium:
            'AI models have lifecycle processes, but they are applied inconsistently. Updates and validations may occur only for major releases or rely on partial automation, and configuration management has gaps in traceability or rollback. For example, model updates are controlled but lack rollback or partial validation. Or, model training is performed outside production, but the model is periodically updated with new data, creating potential vulnerabilities if update pipelines are not rigorously secured or validated.',
          High: 'AI models lack a structured lifecycle or update process. Retraining and validation occur ad hoc, and configuration or version records are incomplete or absent, leaving models at risk of remaining outdated or improperly tuned. For example, model updates may have uncontrolled retraining, no version tracking, or updates pushed without validation. Or, the model continuously learns in production through unsupervised ingestion of live data, raising risks of data poisoning, drift, and unmonitored integrity breaches.',
        },
      },
      {
        number: '09',
        id: 'tech-09',
        title: 'AI Monitoring, Incident Detection And Response',
        description:
          'At runtime (post-deployment), how effectively can the organization (vendor, implementing organization, or combination) monitor the AI solution and underlying model(s) to detect, classify, and respond to incidents (e.g., output anomalies, emergent bias or drift, hallucinations, security breaches, downstream impacts on dependent systems, or data integrity issues such as poisoning, drift, or unmonitored integrity breaches at runtime)?',
        definitions: {
          Low: 'Automated, timely (periodic or continuous based on relevance to use case) monitoring tracks performance, security, and emergent bias or drift. Runtime data integrity safeguards detect poisoning attempts, anomalous data ingest, and integrity breaches. Anomaly alerts have predefined severity levels and integrate with both AI safety and enterprise IT incident management workflows, and clear response protocols guide investigation and mitigation.',
          Medium:
            'Some monitoring exists, often in batch or aggregate form. Detection of anomalies, emergent bias, drift, or data integrity issues may rely on manual review, and response processes are only partially defined or linked to enterprise incident management.',
          High: 'Monitoring is minimal or absent, allowing emergent bias, drift, output errors, or data integrity breaches (e.g., poisoning, unmonitored integrity loss) to persist undetected. There is no clear separation between operational incidents and AI safety incidents, and escalation or response procedures are missing.',
        },
      },
      {
        number: '10',
        id: 'tech-10',
        title: 'AI Detection And Traceability',
        description:
          'How well can end users (providers, patients, staff, as appropriate) detect when and how AI is influencing outputs, decisions, or workflows (e.g., transparency into the AI solution’s use and integration into downstream tasks)?',
        definitions: {
          Low: 'All AI-generated outputs are clearly labeled and traceable (for both human-facing outputs and machine-to-machine interactions); users are informed when AI is involved in recommendations or automation. Full audit trails exist.',
          Medium:
            'Some AI outputs are identifiable, but others may blend with non-AI content; labeling or auditability is partially implemented (though partial audit trails can make investigations after an incident more difficult).',
          High: 'AI involvement is not visible to end users; decisions or recommendations may be made or influenced by AI without detection, leading to risks such as automation bias, silent failures, or unsafe overrides. Invisible AI influence can conflict with regulatory labeling or patient consent requirements.',
        },
      },
    ],
  },
]

/** The four phases of CHAI's risk-management model (Overview page). */
export const RISK_PHASES = [
  {
    n: 1,
    name: 'Risk Categorization',
    current: true,
    text: 'Classify AI solutions as Low, Medium, or High risk during pre-deployment. This determines the level of rigor needed for later assessments and controls.',
  },
  {
    n: 2,
    name: 'Risk Assessment',
    current: false,
    text: "For AI solutions with (at least) High risk, conduct a detailed analysis based on your organization's risk tolerance.",
  },
  {
    n: 3,
    name: 'Risk Mitigation',
    current: false,
    text: 'Implement and document actions (risk mitigation controls) to reduce identified risks.',
  },
  {
    n: 4,
    name: 'Risk Monitoring',
    current: false,
    text: "Continuously monitor the AI solution's performance and safety over time.",
  },
]

export const ALL_MODIFIERS = DOMAINS.flatMap((d) =>
  d.modifiers.map((m) => ({ ...m, domainId: d.id, domainName: d.name })),
)

export const TOTAL_MODIFIERS = ALL_MODIFIERS.length
