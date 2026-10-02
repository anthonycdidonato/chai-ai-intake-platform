import { useState } from 'react'
import {
  DOMAINS,
  RESPONSE_OPTIONS,
  type ResponseValue,
  type RiskModifier,
} from '../data/riskData'
import { EvidencePicker } from './EvidencePicker'
import { computeDetermination, confirmedLevel } from '../lib/scoring'
import { levelClass, LevelBadge } from './bits'
import type { Assessment, ModifierState } from '../lib/types'

export function Categorize({
  a,
  onSetLevel,
  onSetNotes,
  onAddEvidence,
  onRemoveEvidence,
  onConfirmAll,
  onAccept,
  onBack,
}: {
  a: Assessment
  onSetLevel: (modifierId: string, level: ResponseValue | undefined) => void
  onSetNotes: (modifierId: string, notes: string) => void
  onAddEvidence: (packageId: string, name: string, example?: string) => void
  onRemoveEvidence: (id: string) => void
  onConfirmAll: () => void
  onAccept: () => void
  onBack: () => void
}) {
  const det = computeDetermination(a.modifiers)
  const gaps = det.needsInfoCount

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Suggested categorization</div>
            <h2 style={{ margin: '0 0 4px' }}>
              {a.solutionName || 'This solution'} looks like{' '}
              <LevelBadge level={det.overall} big />
            </h2>
            <p className="small muted" style={{ margin: 0, maxWidth: '64ch' }}>
              Overall risk is the highest level across all {DOMAINS.reduce((n, d) => n + d.modifiers.length, 0)}{' '}
              modifiers — the CHAI tool does not average them, because one High modifier is enough
              to warrant a detailed risk assessment. Review each suggestion below and confirm or
              change it; your confirmation is what drives the mitigation controls.
            </p>
          </div>
        </div>

        <div className="summary-grid" style={{ marginTop: 20 }}>
          {det.domains.map((d) => (
            <div key={d.domainId} className={`stat risk-${levelClass(d.level)}`}>
              <div className="k">{d.domainName}</div>
              <div className="v">{d.level}</div>
              <div className="tiny muted" style={{ marginTop: 6 }}>
                {d.counts.High} high · {d.counts.Medium} medium · {d.counts.Low} low
                {d.counts['Need More Info'] > 0 && ` · ${d.counts['Need More Info']} unanswered`}
              </div>
            </div>
          ))}
          <div className="stat risk-info">
            <div className="k">Confirmed by you</div>
            <div className="v">
              {det.confirmedCount} / {DOMAINS.reduce((n, d) => n + d.modifiers.length, 0)}
            </div>
            <div className="meter" aria-hidden="true">
              <i
                style={{
                  width: `${(det.confirmedCount / DOMAINS.reduce((n, d) => n + d.modifiers.length, 0)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {gaps > 0 && (
        <div className="alert warn">
          <span aria-hidden="true">⚠</span>
          <span>
            <strong>
              {gaps} modifier{gaps === 1 ? '' : 's'} need{gaps === 1 ? 's' : ''} more information.
            </strong>{' '}
            The documentation on file can&apos;t answer {gaps === 1 ? 'it' : 'them'}. Open the
            modifier to see exactly which document would resolve it and record it there — the
            categorization updates as you go. You can also set a level yourself if you already know
            the answer.
          </span>
        </div>
      )}

      {det.highCount > 0 && (
        <div className="alert danger">
          <span aria-hidden="true">●</span>
          <span>
            <strong>
              {det.highCount} modifier{det.highCount === 1 ? '' : 's'} categorized High.
            </strong>{' '}
            CHAI strongly recommends a detailed risk assessment (hazard, harm, probability) for this
            solution, in addition to the mitigation controls on the next step.
          </span>
        </div>
      )}

      {DOMAINS.map((domain) => (
        <section key={domain.id}>
          <div className="domain-head">
            <h2>{domain.name}</h2>
            <LevelBadge level={det.domains.find((d) => d.domainId === domain.id)!.level} />
            <span className="tiny muted">{domain.blurb}</span>
          </div>
          {domain.modifiers.map((m) => (
            <ModifierRow
              key={m.id}
              modifier={m}
              state={a.modifiers[m.id]}
              evidence={a.evidence}
              onSetLevel={(lvl) => onSetLevel(m.id, lvl)}
              onSetNotes={(n) => onSetNotes(m.id, n)}
              onAddEvidence={onAddEvidence}
              onRemoveEvidence={onRemoveEvidence}
            />
          ))}
        </section>
      ))}

      <div className="sticky-bar no-print">
        <div className="wrap">
          <button className="btn ghost" onClick={onBack}>
            ← Edit description
          </button>
          {det.confirmedCount < DOMAINS.reduce((n, d) => n + d.modifiers.length, 0) && (
            <button className="btn secondary" onClick={onConfirmAll}>
              Accept all suggestions as-is
            </button>
          )}
          <span className="spacer" />
          <span className="small muted">
            {gaps > 0
              ? `${gaps} unanswered — controls behind ${gaps === 1 ? 'it' : 'them'} can't be determined yet`
              : 'All modifiers answered'}
          </span>
          <button className="btn lg" onClick={onAccept}>
            Confirm and see mitigations →
          </button>
        </div>
      </div>
    </>
  )
}

function ModifierRow({
  modifier,
  state,
  evidence,
  onSetLevel,
  onSetNotes,
  onAddEvidence,
  onRemoveEvidence,
}: {
  modifier: RiskModifier
  state: ModifierState | undefined
  evidence: Assessment['evidence']
  onSetLevel: (level: ResponseValue | undefined) => void
  onSetNotes: (notes: string) => void
  onAddEvidence: (packageId: string, name: string, example?: string) => void
  onRemoveEvidence: (id: string) => void
}) {
  const level = state ? confirmedLevel(state) : 'Need More Info'
  const [open, setOpen] = useState(level === 'Need More Info')
  if (!state) return null

  return (
    <div className={`mod lv-${levelClass(level)}`}>
      <button className="mod-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="caret" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        <span className="mod-num">{modifier.number}</span>
        <span className="mod-title">{modifier.title}</span>
        <span className="mod-right">
          {state.confirmed ? (
            <span className="badge info plain">Confirmed</span>
          ) : (
            <span className="tiny muted">suggested</span>
          )}
          <LevelBadge level={level} />
        </span>
      </button>

      {open && (
        <div className="mod-body">
          <div className="mod-section">
            <h4>What this measures</h4>
            <p className="small" style={{ marginBottom: 0 }}>
              {modifier.description}
            </p>
          </div>

          <div className="mod-section">
            <h4>Why CHAI suggested {state.suggested}</h4>
            <p className="rationale">{state.rationale}</p>
          </div>

          <div className="mod-section">
            <h4>CHAI definitions — pick the one that fits</h4>
            <div className="defs">
              {(['Low', 'Medium', 'High'] as const).map((lv) => (
                <button
                  key={lv}
                  className={`def ${lv.toLowerCase()}${level === lv ? ' selected' : ''}`}
                  onClick={() => onSetLevel(lv)}
                  aria-pressed={level === lv}
                >
                  <h5>{lv}</h5>
                  {modifier.definitions[lv]}
                </button>
              ))}
            </div>
          </div>

          <div className="mod-section">
            <h4>Your determination</h4>
            <div className="seg">
              {RESPONSE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={opt.toLowerCase().replace(/[^a-z]/g, '')}
                  aria-pressed={level === opt}
                  onClick={() => onSetLevel(opt)}
                >
                  {opt}
                </button>
              ))}
              {state.confirmed && (
                <button onClick={() => onSetLevel(undefined)} title="Revert to CHAI's suggestion">
                  ↺ Reset
                </button>
              )}
            </div>
          </div>

          {state.missingEvidence.length > 0 && (
            <div className="mod-section">
              <h4>
                {level === 'Need More Info'
                  ? 'Record the documentation that would answer this'
                  : 'Documentation that would raise confidence'}
              </h4>
              <EvidencePicker
                evidence={evidence}
                onAdd={onAddEvidence}
                onRemove={onRemoveEvidence}
                only={state.missingEvidence}
                addedDuring="review"
              />
            </div>
          )}

          <div className="mod-section">
            <h4>Notes</h4>
            <textarea
              className="notes"
              value={state.notes ?? ''}
              placeholder="Why you landed where you did — carried into the export."
              onChange={(e) => onSetNotes(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
