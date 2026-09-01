import { EVIDENCE_PACKAGES } from '../data/evidencePackages'
import type { EvidenceFile, IntakeSession, OrgType } from '../lib/types'
import { EvidenceUploader } from './EvidenceUploader'

const EXAMPLE_USE_CASE =
  'AI-assisted sepsis early-warning tool for inpatient medical-surgical units. The model scores ' +
  'vitals and labs from the EHR every 15 minutes and pushes a real-time alert to the bedside nurse ' +
  'and rapid-response team when risk crosses a threshold. A clinician reviews each alert and ' +
  'decides whether to escalate — the AI recommends, the human decides. Data are identified PHI ' +
  'drawn from our Epic instance, standardized to LOINC and SNOMED, with a nightly refresh. ' +
  'Deployed across three hospitals in our system, integrated with the EHR via FHIR APIs. ' +
  'Monitoring is real-time with automated drift detection; all AI-generated outputs are clearly ' +
  'labeled in the chart and a full audit trail is retained.'

interface Props {
  session: IntakeSession
  onChange: (patch: Partial<IntakeSession>) => void
  onAddEvidence: (files: EvidenceFile[]) => void
  onRemoveEvidence: (id: string) => void
  onGenerate: () => void
}

export function IntakeForm({
  session,
  onChange,
  onAddEvidence,
  onRemoveEvidence,
  onGenerate,
}: Props) {
  const suppliedCount = new Set(session.evidence.map((f) => f.packageId)).size
  const ready = session.useCase.trim().length >= 40
  const words = session.useCase.trim() ? session.useCase.trim().split(/\s+/).length : 0

  return (
    <>
      <div className="card">
        <p className="eyebrow">Step 1 of 4</p>
        <h2>Describe your use case</h2>
        <p className="muted small" style={{ maxWidth: '80ch' }}>
          The more the description says about how close the AI sits to the patient, how much
          autonomy it has, what data it uses, where it runs, and how it is monitored, the fewer
          modifiers will come back as <em>Needs More Information</em>. CHAI's Applied Model Card
          sections "Uses and Directions", "AI System Facts", and "Ongoing Maintenance" are good
          sources for this.
        </p>

        <div className="grid-3">
          <div className="field">
            <label htmlFor="org">Organization</label>
            <input
              id="org"
              type="text"
              value={session.orgName}
              placeholder="e.g. Riverside Health System"
              onChange={(e) => onChange({ orgName: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="orgtype">Organization type</label>
            <select
              id="orgtype"
              value={session.orgType}
              onChange={(e) => onChange({ orgType: e.target.value as OrgType })}
            >
              <option value="hdo">Healthcare delivery organization</option>
              <option value="vendor">Technology vendor</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="sol">AI solution name</label>
            <input
              id="sol"
              type="text"
              value={session.solutionName}
              placeholder="e.g. SepsisWatch v2.1"
              onChange={(e) => onChange({ solutionName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="who">Your name</label>
            <input
              id="who"
              type="text"
              value={session.submitterName}
              placeholder="Full name"
              onChange={(e) => onChange({ submitterName: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="mail">Your email</label>
            <input
              id="mail"
              type="email"
              value={session.submitterEmail}
              placeholder="you@organization.org"
              onChange={(e) => onChange({ submitterEmail: e.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="uc">Use case description</label>
          <textarea
            id="uc"
            value={session.useCase}
            placeholder="What does the AI solution do, who uses it, which patients does it affect, what data does it use, where is it deployed, and how is it monitored?"
            onChange={(e) => onChange({ useCase: e.target.value })}
          />
          <div className="btn-row" style={{ marginTop: 8 }}>
            <span className="tiny muted">
              {words} word{words === 1 ? '' : 's'}
              {!ready && ' — a fuller description produces a sharper categorization'}
            </span>
            <span className="spacer" />
            {!session.useCase && (
              <button
                className="btn ghost sm"
                onClick={() => onChange({ useCase: EXAMPLE_USE_CASE })}
              >
                Load an example description
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <p className="eyebrow">Step 1 of 4</p>
        <h2>Upload relevant evidence</h2>
        <p className="muted small" style={{ maxWidth: '80ch' }}>
          Attach whatever you have now — you can add more at any point, including directly on a
          modifier flagged <em>Needs More Information</em> later in the workflow. Files stay on your
          device in this prototype; only the evidence manifest is recorded with the session.
        </p>
        <p className="small">
          <strong>{suppliedCount}</strong> of {EVIDENCE_PACKAGES.length} evidence packages have at
          least one document · <strong>{session.evidence.length}</strong> document
          {session.evidence.length === 1 ? '' : 's'} total
        </p>
        <EvidenceUploader
          evidence={session.evidence}
          onAdd={onAddEvidence}
          onRemove={onRemoveEvidence}
          stage="intake"
        />
      </div>

      <div className="sticky-bar no-print">
        <div className="wrap">
          <span className="small muted">
            {ready
              ? 'Ready. The platform will categorize all 19 risk modifiers.'
              : 'Add a use case description of at least a sentence or two to continue.'}
          </span>
          <span className="spacer" />
          <button className="btn lg" onClick={onGenerate} disabled={!ready}>
            Generate Risk Categorization →
          </button>
        </div>
      </div>
    </>
  )
}
