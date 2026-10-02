import { useState } from 'react'
import { MITIGATIONS } from '../data/mitigations'
import { ALL_MODIFIERS } from '../data/riskData'
import { summarizeMitigations, type TriggeredMitigation } from '../lib/mitigations'
import { computeDetermination } from '../lib/scoring'
import { LevelBadge, levelClass } from './bits'
import type { Assessment } from '../lib/types'
import type { RiskLevel } from '../data/riskData'

type Filter = 'all' | RiskLevel

export function Mitigate({
  a,
  onBack,
  onNext,
}: {
  a: Assessment
  onBack: () => void
  onNext: () => void
}) {
  const det = computeDetermination(a.modifiers)
  const { triggered, byPeak, unresolved } = summarizeMitigations(a.modifiers)
  const [filter, setFilter] = useState<Filter>('all')
  const [modifier, setModifier] = useState<string>('all')

  const shown = triggered
    .filter((t) => filter === 'all' || t.peak === filter)
    .filter((t) => modifier === 'all' || t.reasons.some((r) => r.modifierId === modifier))

  /** Modifiers that actually triggered something, for the filter. */
  const triggeringModifiers = ALL_MODIFIERS.filter((m) =>
    triggered.some((t) => t.reasons.some((r) => r.modifierId === m.id)),
  )

  return (
    <>
      <div className="card">
        <div className="eyebrow">Mitigation controls</div>
        <h2 style={{ margin: '0 0 6px' }}>
          Your risk profile calls for {triggered.length} of CHAI&apos;s {MITIGATIONS.length}{' '}
          controls
        </h2>
        <p className="small muted" style={{ maxWidth: '66ch' }}>
          A control appears here when a risk modifier you confirmed is at a level that control
          applies to. Each one names the modifier and level that pulled it in, so you can check the
          reasoning — and drop any that your organization has already implemented.
        </p>

        <div className="summary-grid" style={{ marginTop: 18 }}>
          <div className={`stat risk-${levelClass(det.overall)}`}>
            <div className="k">Overall risk</div>
            <div className="v">{det.overall}</div>
          </div>
          <div className="stat risk-high">
            <div className="k">Start here</div>
            <div className="v">{byPeak.High}</div>
            <div className="tiny muted" style={{ marginTop: 6 }}>
              Pulled in by a High modifier
            </div>
          </div>
          <div className="stat risk-info">
            <div className="k">Not triggered</div>
            <div className="v">{MITIGATIONS.length - triggered.length}</div>
            <div className="tiny muted" style={{ marginTop: 6 }}>
              Outside this risk profile
            </div>
          </div>
        </div>

        {byPeak.High > 20 && (
          <p className="small muted" style={{ margin: '16px 0 0', maxWidth: '66ch' }}>
            A solution with {det.highCount} High modifier{det.highCount === 1 ? '' : 's'} pulls in
            most of the library — that is the honest answer, not a filtering failure. Work down from
            the High band, and use the modifier filter to take one risk at a time.
          </p>
        )}
      </div>

      {unresolved.length > 0 && (
        <div className="alert warn no-print">
          <span aria-hidden="true">⚠</span>
          <span>
            <strong>
              {unresolved.length} modifier{unresolved.length === 1 ? '' : 's'} still unanswered.
            </strong>{' '}
            Controls that depend on {unresolved.length === 1 ? 'it' : 'them'} are not shown, so this
            list is incomplete. Unanswered:{' '}
            {unresolved.map((u) => `${u.number} ${u.title}`).join(', ')}.{' '}
            <button className="linkish" onClick={onBack}>
              Go back and resolve
            </button>
          </span>
        </div>
      )}

      <div className="filter-bar no-print">
        <span className="tiny muted">Urgency</span>
        <div className="seg">
          {(['all', 'High', 'Medium', 'Low'] as Filter[]).map((f) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? `All ${triggered.length}` : `${f} (${byPeak[f as RiskLevel]})`}
            </button>
          ))}
        </div>
        <span className="spacer" />
        <label htmlFor="modfilter" className="tiny muted" style={{ marginBottom: 0 }}>
          Risk modifier
        </label>
        <select
          id="modfilter"
          className="mod-filter"
          value={modifier}
          onChange={(e) => setModifier(e.target.value)}
        >
          <option value="all">Any modifier</option>
          {triggeringModifiers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.number} {m.title}
            </option>
          ))}
        </select>
      </div>

      <p className="small muted" style={{ marginTop: -4 }}>
        Showing {shown.length} control{shown.length === 1 ? '' : 's'}.
      </p>

      {shown.length === 0 ? (
        <div className="card tight">
          <p className="muted" style={{ margin: 0 }}>
            No controls match both filters. Widen the urgency band or choose another modifier.
          </p>
        </div>
      ) : (
        shown.map((t) => <ControlCard key={t.id} control={t} />)
      )}

      <div className="sticky-bar no-print">
        <div className="wrap">
          <button className="btn ghost" onClick={onBack}>
            ← Back to categorization
          </button>
          <span className="spacer" />
          <button className="btn lg" onClick={onNext}>
            Review and export →
          </button>
        </div>
      </div>
    </>
  )
}

function ControlCard({ control }: { control: TriggeredMitigation }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`mod lv-${levelClass(control.peak)}`}>
      <button className="mod-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="caret" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        <span className="mod-num">{control.id}</span>
        <span className="mod-title">{control.name}</span>
        <span className="mod-right">
          <span className="tiny muted">
            {control.reasons.length} modifier{control.reasons.length === 1 ? '' : 's'}
          </span>
          <LevelBadge level={control.peak} />
        </span>
      </button>

      {open && (
        <div className="mod-body">
          <div className="mod-section">
            <h4>What to implement</h4>
            <p className="small" style={{ marginBottom: 0 }}>
              {control.description}
            </p>
          </div>
          <div className="mod-section">
            <h4>Why it was triggered</h4>
            <ul className="reason-list">
              {control.reasons.map((r) => (
                <li key={r.modifierId}>
                  <LevelBadge level={r.level} />
                  <span>
                    <strong>
                      {r.modifierNumber} {r.modifierTitle}
                    </strong>
                    <span className="tiny muted"> · {r.domainName}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="tiny muted" style={{ margin: '10px 0 0' }}>
              This control applies at: {control.appliesAt.join(', ')}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
