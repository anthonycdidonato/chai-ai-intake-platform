import { useState } from 'react'
import { ACTIONS, RESPONSE_OPTIONS, type ResponseValue, type RiskModifier } from '../data/riskData'
import { packageName } from '../data/evidencePackages'
import { effectiveLevel } from '../lib/inference'
import type { EvidenceFile, ModifierState } from '../lib/types'
import { EvidenceUploader } from './EvidenceUploader'

export function levelClass(level: ResponseValue): string {
  switch (level) {
    case 'Low':
      return 'low'
    case 'Medium':
      return 'medium'
    case 'High':
      return 'high'
    case 'Need More Info':
      return 'info'
    default:
      return 'na'
  }
}

export function levelSlug(level: ResponseValue): string {
  switch (level) {
    case 'Low':
      return 'low'
    case 'Medium':
      return 'medium'
    case 'High':
      return 'high'
    case 'Need More Info':
      return 'needsinfo'
    default:
      return 'na'
  }
}

export function RiskBadge({ level }: { level: ResponseValue }) {
  const label = level === 'Need More Info' ? 'Needs More Information' : level
  return <span className={`badge ${levelClass(level)}`}>{label}</span>
}

interface Props {
  modifier: RiskModifier
  state: ModifierState
  contributionPct: number
  evidence: EvidenceFile[]
  onOverride: (level: ResponseValue | undefined) => void
  onWeight: (weight: number) => void
  onNotes: (notes: string) => void
  onAddEvidence: (files: EvidenceFile[]) => void
  onRemoveEvidence: (id: string) => void
  defaultOpen?: boolean
}

export function ModifierCard({
  modifier,
  state,
  contributionPct,
  evidence,
  onOverride,
  onWeight,
  onNotes,
  onAddEvidence,
  onRemoveEvidence,
  defaultOpen,
}: Props) {
  const level = effectiveLevel(state)
  const [open, setOpen] = useState(!!defaultOpen || level === 'Need More Info')
  const [showGapUploader, setShowGapUploader] = useState(level === 'Need More Info')

  const gapPackages = state.missingEvidence

  return (
    <div className={`mod lv-${levelSlug(level)}`}>
      <button className="mod-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="mod-num">{modifier.number}</span>
        <span>
          <span className="mod-title">{modifier.title}</span>
          {state.override && (
            <span className="tiny muted" style={{ display: 'block' }}>
              Member override — platform suggested {state.suggested}
            </span>
          )}
        </span>
        <span className="mod-right">
          {level !== 'Need More Info' && level !== 'N/A' && (
            <span className="contrib" title="Share of the weighted overall score">
              {contributionPct.toFixed(1)}% of overall
            </span>
          )}
          <span className="chip">w {state.weight.toFixed(1)}</span>
          <RiskBadge level={level} />
          <span aria-hidden="true" style={{ color: 'var(--medium-blue)', fontSize: '.8rem' }}>
            {open ? '▾' : '▸'}
          </span>
        </span>
      </button>

      {open && (
        <div className="mod-body">
          <div className="mod-section">
            <p className="small muted" style={{ margin: 0 }}>
              {modifier.description}
            </p>
          </div>

          <div className="mod-section">
            <h4>CHAI risk definitions</h4>
            <div className="defs">
              {(['Low', 'Medium', 'High'] as const).map((lv) => (
                <div
                  key={lv}
                  className={`def ${lv.toLowerCase()}${level === lv ? ' selected' : ''}`}
                >
                  <h5>{lv} risk</h5>
                  {modifier.definitions[lv]}
                </div>
              ))}
            </div>
          </div>

          <div className="mod-section">
            <h4>
              Why the platform suggested {state.suggested === 'Need More Info' ? 'more information' : state.suggested}
              {' '}· confidence {state.confidence.toLowerCase()}
            </h4>
            <p className="rationale">{state.rationale}</p>
          </div>

          {(state.supportingEvidence.length > 0 || gapPackages.length > 0) && (
            <div className="mod-section">
              <h4>Evidence for this modifier</h4>
              <div className="chips">
                {state.supportingEvidence.map((id) => (
                  <span className="chip ok" key={id}>
                    ✓ {packageName(id)}
                  </span>
                ))}
                {gapPackages.map((id) => (
                  <button
                    className="chip gap"
                    key={id}
                    onClick={() => setShowGapUploader(true)}
                    title="Add this evidence now"
                  >
                    + {packageName(id)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gapPackages.length > 0 && (
            <div className="mod-section">
              {showGapUploader ? (
                <>
                  <h4>Add the missing evidence — the categorization updates immediately</h4>
                  <EvidenceUploader
                    evidence={evidence}
                    onAdd={onAddEvidence}
                    onRemove={onRemoveEvidence}
                    stage="review"
                    only={gapPackages}
                    highlight={[gapPackages[0]]}
                    compact
                  />
                </>
              ) : (
                <button className="btn ghost sm" onClick={() => setShowGapUploader(true)}>
                  Add evidence for this modifier
                </button>
              )}
            </div>
          )}

          <div className="mod-section">
            <h4>Your response</h4>
            <div className="seg" role="group" aria-label={`Response for ${modifier.title}`}>
              {RESPONSE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={levelClass(opt)}
                  aria-pressed={level === opt}
                  onClick={() => onOverride(opt === state.suggested ? undefined : opt)}
                >
                  {opt === 'Need More Info' ? 'Needs More Info' : opt}
                </button>
              ))}
            </div>
            {state.override && (
              <button
                className="btn ghost sm"
                style={{ marginLeft: 10 }}
                onClick={() => onOverride(undefined)}
              >
                Reset to suggested ({state.suggested})
              </button>
            )}
            <p className="tiny muted" style={{ margin: '10px 0 0' }}>
              <strong>Action:</strong> {ACTIONS[level]}
            </p>
          </div>

          <div className="mod-section">
            <h4>Weight — how much this modifier counts toward the overall risk</h4>
            <div className="weight-row">
              <input
                type="range"
                min={0}
                max={3}
                step={0.25}
                value={state.weight}
                onChange={(e) => onWeight(Number(e.target.value))}
                aria-label={`Weight for ${modifier.title}`}
              />
              <span className="wval">{state.weight.toFixed(2)}</span>
              <button className="btn ghost sm" onClick={() => onWeight(1)}>
                Reset to 1.00
              </button>
            </div>
            <p className="tiny muted" style={{ margin: '6px 0 0' }}>
              {state.weight === 0
                ? 'Excluded from the weighted overall risk.'
                : `Currently contributing ${contributionPct.toFixed(1)}% of the weighted overall risk. ` +
                  `Default weight is 1.00; the range is 0 (exclude) to 3 (triple weight).`}
            </p>
          </div>

          <div className="mod-section">
            <h4>Notes &amp; comments</h4>
            <textarea
              style={{ minHeight: 70 }}
              value={state.notes ?? ''}
              placeholder="Rationale for an override, open questions, or context for CHAI administrators."
              onChange={(e) => onNotes(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
