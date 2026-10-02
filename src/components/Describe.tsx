import { EvidencePicker } from './EvidencePicker'
import { EVIDENCE_PACKAGES } from '../data/evidencePackages'
import { TOTAL_MODIFIERS } from '../data/riskData'
import { MITIGATIONS } from '../data/mitigations'
import type { Assessment, EvidenceItem } from '../lib/types'

export function Describe({
  a,
  onChange,
  onAddEvidence,
  onRemoveEvidence,
  onGenerate,
}: {
  a: Assessment
  onChange: (patch: Partial<Assessment>) => void
  onAddEvidence: (packageId: string, name: string, example?: string) => void
  onRemoveEvidence: (id: string) => void
  onGenerate: () => void
}) {
  const received = new Set(a.evidence.map((e) => e.packageId)).size
  const ready = a.useCase.trim().length >= 40

  return (
    <>
      <div className="hero">
        <div className="hero-pattern" aria-hidden="true">
          {Array.from({ length: 32 }, (_, i) => (
            <span key={i} style={{ opacity: (i % 5) / 6 + 0.2 }} />
          ))}
        </div>
        <h1>How risky is this vendor&apos;s AI solution?</h1>
        <p className="lede">
          Describe what the solution does and record which documents the vendor has given you. CHAI
          suggests a risk level for each of the {TOTAL_MODIFIERS} risk modifiers and for the
          solution overall — and says plainly where the documentation you have cannot answer the
          question. Once you confirm the categorization, you get the mitigation controls that risk
          profile calls for, drawn from CHAI&apos;s library of {MITIGATIONS.length}.
        </p>
        <div className="privacy-note">
          <span aria-hidden="true">🔒</span>
          <span>
            <strong>Private to your organization.</strong> Your use case, documentation list, and
            risk determination stay in this browser. Nothing is uploaded.
          </span>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Step 1 · The solution under review</div>
        <div className="grid-4">
          <div className="field">
            <label htmlFor="vendor">Vendor</label>
            <input
              id="vendor"
              type="text"
              value={a.vendorName}
              placeholder="e.g. Acme Health AI"
              onChange={(e) => onChange({ vendorName: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="solution">Solution</label>
            <input
              id="solution"
              type="text"
              value={a.solutionName}
              placeholder="e.g. SepsisWatch"
              onChange={(e) => onChange({ solutionName: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="org">Your organization</label>
            <input
              id="org"
              type="text"
              value={a.reviewerOrg}
              placeholder="e.g. Riverside Health"
              onChange={(e) => onChange({ reviewerOrg: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="reviewer">Your name</label>
            <input
              id="reviewer"
              type="text"
              value={a.reviewerName}
              placeholder="Who is doing this review"
              onChange={(e) => onChange({ reviewerName: e.target.value })}
            />
          </div>
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="usecase">What does the solution do, and where is it used?</label>
          <p className="tiny muted" style={{ margin: '0 0 8px' }}>
            The more specific you are about who uses it, what it decides, which patients it touches,
            and what data it runs on, the more modifiers the platform can categorize for you.
          </p>
          <textarea
            id="usecase"
            value={a.useCase}
            placeholder="e.g. An inpatient deterioration model that runs on EHR vitals and labs every 15 minutes and surfaces a risk score to the rapid response nurse, who decides whether to escalate. Deployed across four medical-surgical units. Uses identified patient data (PHI) and writes no orders."
            onChange={(e) => onChange({ useCase: e.target.value })}
          />
          <p className="tiny muted" style={{ margin: '6px 0 0' }}>
            {a.useCase.trim().length} characters
            {!ready && ' — a sentence or two more will noticeably improve the suggestions'}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Step 2 · Documentation received from the vendor</div>
            <p className="small muted" style={{ margin: 0, maxWidth: '62ch' }}>
              Record what you have in hand. You don&apos;t upload anything — the categorization
              depends on <em>which</em> packages you hold, not on their contents, and you can add
              more at any point without losing work.
            </p>
          </div>
          <span className="badge info plain">
            {received} of {EVIDENCE_PACKAGES.length} packages
          </span>
        </div>

        <div style={{ marginTop: 18 }}>
          <EvidencePicker
            evidence={a.evidence}
            onAdd={onAddEvidence}
            onRemove={onRemoveEvidence}
            addedDuring="intake"
          />
        </div>
      </div>

      <div className="sticky-bar no-print">
        <div className="wrap">
          <span className="small muted">
            {received === 0
              ? 'No documentation recorded yet — you can still generate a categorization, and most modifiers will come back as “Needs more information.”'
              : `${a.evidence.length} document${a.evidence.length === 1 ? '' : 's'} across ${received} package${received === 1 ? '' : 's'}.`}
          </span>
          <span className="spacer" />
          <button className="btn lg" onClick={onGenerate} disabled={!a.useCase.trim()}>
            Suggest risk categorization →
          </button>
        </div>
      </div>
    </>
  )
}

export type { EvidenceItem }
