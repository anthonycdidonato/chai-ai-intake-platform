import { useRef, useState } from 'react'
import { EVIDENCE_PACKAGES, packageName } from '../data/evidencePackages'
import type { Assessment, UploadedDoc } from '../lib/types'

/** Best-effort guess of the CHAI document type from a filename. The reviewer confirms. */
export function guessType(name: string): string | undefined {
  const n = name.toLowerCase().replace(/[_\-.]+/g, ' ')
  const rules: [RegExp, string][] = [
    [/model.?card/, 'model-card'],
    [/\bbaa\b|business.?associate|privacy|data.?use/, 'baa-privacy'],
    [/soc.?2|hitrust|iso.?27001|pen.?test|penetration|iam|access.?control|security.?cert/, 'security-cert'],
    [/red.?team|threat.?model|ai.?security|prompt.?inject/, 'ai-security'],
    [/fmea|failure.?mode|safety|human.?factors|post.?market/, 'safety-failure'],
    [/audit.?log|runbook|shutdown|override|suspension/, 'transparency-control'],
    [/bias|subgroup|validation.?study|whitepaper|fda|drift/, 'validation-bias'],
    [/usability|user.?research|override.?rate/, 'usability-evidence'],
    [/continuity|downtime|incident.?response|contingency|dependency/, 'operational-resilience'],
    [/acceptable.?use|training|curriculum|escalation/, 'acceptable-use'],
    [/validation.?plan|poc|proof.?of.?concept|benchmark/, 'validation-plan'],
    [/workflow|integration|architecture|ux|help.?desk/, 'workflow-integration'],
    [/sla|monitoring|lifecycle|versioning|governance|kpi|disclosure/, 'ops-monitoring'],
  ]
  return rules.find(([re]) => re.test(n))?.[1]
}

const fmtSize = (b: number) => (b < 1e6 ? `${Math.max(1, Math.round(b / 1e3))} KB` : `${(b / 1e6).toFixed(1)} MB`)

export function Intake({ a, onChange, onAddFiles, onSetType, onRemove, onNext }: {
  a: Assessment
  onChange: (p: Partial<Assessment>) => void
  onAddFiles: (files: FileList | File[]) => void
  onSetType: (id: string, packageId: string | undefined) => void
  onRemove: (id: string) => void
  onNext: () => void
}) {
  const [over, setOver] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const typed = a.documents.filter((d) => d.packageId).length
  const canNext = a.solutionName.trim().length > 0

  return (
    <>
      <div className="hero compact">
        <h1>Is this AI solution safe to bring in?</h1>
        <p className="lede">
          Three steps. Describe the solution and upload what you have. CHAI suggests a risk level for each of its 19 risk
          modifiers wherever the documentation supports one, and tells you what to ask for where it doesn&apos;t. Confirm
          the levels, and you get the mitigations to put in place.
        </p>
      </div>

      <div className="card">
        <div className="eyebrow">The AI solution</div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="sol">Solution name</label>
            <input id="sol" type="text" value={a.solutionName} placeholder="e.g. SepsisWatch" onChange={(e) => onChange({ solutionName: e.target.value })} />
          </div>
          <div className="field">
            <label>Where it comes from</label>
            <div className="seg">
              <button aria-pressed={a.source === 'vendor'} onClick={() => onChange({ source: 'vendor' })}>Third-party vendor</button>
              <button aria-pressed={a.source === 'internal'} onClick={() => onChange({ source: 'internal' })}>Internally developed</button>
            </div>
          </div>
          {a.source === 'vendor' && (
            <div className="field">
              <label htmlFor="ven">Vendor</label>
              <input id="ven" type="text" value={a.vendorName} placeholder="e.g. Acme Health AI" onChange={(e) => onChange({ vendorName: e.target.value })} />
            </div>
          )}
          <div className="field">
            <label htmlFor="org">Your organization</label>
            <input id="org" type="text" value={a.orgName} placeholder="e.g. Riverside Health" onChange={(e) => onChange({ orgName: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="rev">Your name</label>
            <input id="rev" type="text" value={a.reviewerName} placeholder="Who is doing this review" onChange={(e) => onChange({ reviewerName: e.target.value })} />
          </div>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="desc">What does it do, who uses it, and on what data?</label>
          <textarea id="desc" value={a.description} onChange={(e) => onChange({ description: e.target.value })}
            placeholder="e.g. Flags inpatients at risk of sepsis from EHR vitals and labs. A rapid response nurse reviews each alert and decides whether to escalate. Runs on identified patient data across all adult med-surg units." />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Documentation</div>
            <p className="small muted" style={{ margin: 0, maxWidth: '62ch' }}>
              Upload anything you&apos;ve received or produced. Then say what each document is — that&apos;s what lets CHAI
              count it as evidence. Files are described, not transmitted.
            </p>
          </div>
          <span className="badge info plain">{typed} of {a.documents.length} counted as evidence</span>
        </div>

        <div className={`dropzone${over ? ' over' : ''}`} style={{ marginTop: 16 }}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); onAddFiles(e.dataTransfer.files) }}>
          <p style={{ margin: '0 0 10px' }}><strong>Drop files here</strong> — any type</p>
          <button className="btn secondary" onClick={() => input.current?.click()}>Choose files</button>
          <input ref={input} type="file" multiple hidden onChange={(e) => { if (e.target.files) onAddFiles(e.target.files); e.target.value = '' }} />
        </div>

        {a.documents.length > 0 && (
          <ul className="file-list" style={{ marginTop: 14 }}>
            {a.documents.map((d: UploadedDoc) => (
              <li key={d.id} className={`file-row${d.packageId ? '' : ' untyped'}`}>
                <span className="fname" title={d.name}>{d.name}</span>
                <span className="fmeta">{fmtSize(d.size)}</span>
                <select value={d.packageId ?? ''} onChange={(e) => onSetType(d.id, e.target.value || undefined)} aria-label={`Document type for ${d.name}`}>
                  <option value="">What is this document?</option>
                  {EVIDENCE_PACKAGES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button onClick={() => onRemove(d.id)} aria-label={`Remove ${d.name}`}>×</button>
              </li>
            ))}
          </ul>
        )}

        <details className="disclose" style={{ marginTop: 16 }}>
          <summary>Documents CHAI&apos;s AI Intake asks for — a reference, not a checklist</summary>
          <ul className="ref-list">
            {EVIDENCE_PACKAGES.map((p) => (
              <li key={p.id}><strong>{packageName(p.id)}</strong><span className="muted"> — {p.examples.join('; ')}</span></li>
            ))}
          </ul>
        </details>
      </div>

      <div className="sticky-bar no-print">
        <div className="wrap">
          <span className="small muted">
            {!canNext
              ? 'Add a solution name to continue.'
              : typed === 0
                ? 'No documents are counted as evidence yet — every modifier will come back as insufficient.'
                : `${typed} document${typed === 1 ? '' : 's'} will be used as evidence.`}
          </span>
          <span className="spacer" />
          <button className="btn lg" onClick={onNext} disabled={!canNext}>Suggest risk levels →</button>
        </div>
      </div>
    </>
  )
}
