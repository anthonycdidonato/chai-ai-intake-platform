import { useMemo, useState } from 'react'
import { ALL_MODIFIERS, DOMAINS, type ResponseValue } from '../data/riskData'
import { effectiveLevel } from '../lib/inference'
import { computeDetermination, contribution } from '../lib/scoring'
import type { EvidenceFile, IntakeSession, ModifierState } from '../lib/types'
import { EvidenceUploader } from './EvidenceUploader'
import { ModifierCard, RiskBadge, levelSlug } from './ModifierCard'

interface Props {
  session: IntakeSession
  onModifier: (id: string, patch: Partial<ModifierState>) => void
  onAddEvidence: (files: EvidenceFile[]) => void
  onRemoveEvidence: (id: string) => void
  onResetWeights: () => void
  onContinue: () => void
  onBack: () => void
}

export function OverallSummary({ session }: { session: IntakeSession }) {
  const det = computeDetermination(session.modifiers)
  const pct = (det.weightedScore / 3) * 100
  return (
    <div className="summary-grid">
      <div className={`stat risk-${levelSlug(det.suggestedOverall as ResponseValue)}`}>
        <div className="k">CHAI suggested overall risk</div>
        <div className="v">
          {det.suggestedOverall === 'Need More Info' ? 'Needs More Info' : det.suggestedOverall}
        </div>
        <p className="tiny muted" style={{ margin: '6px 0 0' }}>
          The more conservative of the CHAI level and your weighted composite.
        </p>
      </div>
      <div className={`stat risk-${levelSlug(det.chaiOverall as ResponseValue)}`}>
        <div className="k">CHAI level (highest modifier)</div>
        <div className="v">
          {det.chaiOverall === 'Need More Info' ? '—' : det.chaiOverall}
        </div>
        <p className="tiny muted" style={{ margin: '6px 0 0' }}>
          The Risk Categorization Tool does not produce a single score; any High modifier warrants a
          detailed risk assessment. Not affected by weights.
        </p>
      </div>
      <div className={`stat risk-${levelSlug(det.weightedOverall)}`}>
        <div className="k">Your weighted composite</div>
        <div className="v">
          {det.weightedOverall}{' '}
          <span style={{ fontSize: '.9rem', fontWeight: 500, color: 'var(--medium-gray)' }}>
            {det.weightedScore.toFixed(2)} / 3.00
          </span>
        </div>
        <div className="meter">
          <i style={{ width: `${pct}%` }} />
        </div>
        <p className="tiny muted" style={{ margin: '6px 0 0' }}>
          Moves in real time as you change modifier weights.
        </p>
      </div>
      <div className={`stat risk-${det.needsInfoCount > 0 ? 'info' : 'low'}`}>
        <div className="k">Open items</div>
        <div className="v">{det.needsInfoCount}</div>
        <p className="tiny muted" style={{ margin: '6px 0 0' }}>
          modifier{det.needsInfoCount === 1 ? '' : 's'} flagged Needs More Information ·{' '}
          {det.highCount} High
        </p>
      </div>
    </div>
  )
}

export function ResultsReview({
  session,
  onModifier,
  onAddEvidence,
  onRemoveEvidence,
  onResetWeights,
  onContinue,
  onBack,
}: Props) {
  const [filter, setFilter] = useState<'all' | 'gaps' | 'high' | 'weighted'>('all')
  const [showAllEvidence, setShowAllEvidence] = useState(false)

  const det = useMemo(() => computeDetermination(session.modifiers), [session.modifiers])
  const allIds = useMemo(() => ALL_MODIFIERS.map((m) => m.id), [])

  function visible(id: string) {
    const st = session.modifiers[id]
    if (!st) return false
    const lv = effectiveLevel(st)
    if (filter === 'gaps') return lv === 'Need More Info'
    if (filter === 'high') return lv === 'High'
    if (filter === 'weighted') return st.weight !== 1
    return true
  }

  const gapCount = det.needsInfoCount
  const visibleCount = allIds.filter(visible).length

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Steps 2 &amp; 3 of 4</p>
            <h2>Suggested risk categorization</h2>
            <p className="small muted" style={{ maxWidth: '82ch', marginBottom: 0 }}>
              {session.solutionName ? <strong>{session.solutionName}</strong> : 'This solution'} was
              categorized across all {ALL_MODIFIERS.length} CHAI risk modifiers from your use case
              description and {session.evidence.length} evidence document
              {session.evidence.length === 1 ? '' : 's'}. Every suggestion below is traceable — open
              a modifier to see exactly which phrase or which evidence package drove it.
            </p>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <OverallSummary session={session} />
        </div>
      </div>

      {gapCount > 0 && (
        <div className="alert info">
          <span aria-hidden="true">ℹ️</span>
          <span>
            <strong>
              {gapCount} modifier{gapCount === 1 ? '' : 's'} flagged “Needs More Information.”
            </strong>{' '}
            These could not be categorized from the evidence supplied. Open any of them and add the
            named evidence right there — the categorization recalculates the moment a file lands.{' '}
            <button className="btn ghost sm" onClick={() => setFilter('gaps')}>
              Show only these
            </button>
          </span>
        </div>
      )}

      {det.highCount > 0 && (
        <div className="alert danger">
          <span aria-hidden="true">⚠️</span>
          <span>
            <strong>
              {det.highCount} modifier{det.highCount === 1 ? '' : 's'} categorized High.
            </strong>{' '}
            Per the CHAI Risk Categorization Tool, a detailed risk assessment covering hazard, harm,
            and probability is strongly recommended, and high-tier evidence packages are triggered.
            Weighting can change your composite but does not remove this recommendation.
          </span>
        </div>
      )}

      <div className="card tight no-print">
        <div className="btn-row">
          <strong className="small">Show</strong>
          <div className="seg">
            {(
              [
                ['all', `All ${ALL_MODIFIERS.length}`],
                ['gaps', `Needs More Info (${gapCount})`],
                ['high', `High (${det.highCount})`],
                ['weighted', 'Re-weighted'],
              ] as const
            ).map(([k, label]) => (
              <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)}>
                {label}
              </button>
            ))}
          </div>
          <span className="spacer" />
          <button className="btn ghost sm" onClick={onResetWeights}>
            Reset all weights to 1.00
          </button>
          <button className="btn ghost sm" onClick={() => setShowAllEvidence((s) => !s)}>
            {showAllEvidence ? 'Hide' : 'Add or manage'} evidence
          </button>
        </div>
        {showAllEvidence && (
          <div style={{ marginTop: 16 }}>
            <p className="small muted">
              Add evidence for any package at any time. Suggestions that you have not overridden
              recalculate immediately; your overrides, weights, and notes are preserved.
            </p>
            <EvidenceUploader
              evidence={session.evidence}
              onAdd={onAddEvidence}
              onRemove={onRemoveEvidence}
              stage="review"
            />
          </div>
        )}
      </div>

      {visibleCount === 0 && (
        <div className="alert ok">
          <span aria-hidden="true">✓</span>
          <span>No modifiers match this filter.</span>
        </div>
      )}

      {DOMAINS.map((domain) => {
        const rows = domain.modifiers.filter((m) => visible(m.id))
        if (rows.length === 0) return null
        const dres = det.domains.find((d) => d.domainId === domain.id)!
        return (
          <section key={domain.id}>
            <div className="domain-head">
              <h2>{domain.name}</h2>
              <span className="badge info plain">{domain.modifiers.length} modifiers</span>
              <span className="spacer" />
              <span className="small muted">CHAI level</span>
              <RiskBadge level={dres.chaiLevel as ResponseValue} />
              <span className="small muted">Weighted</span>
              <RiskBadge level={dres.weightedLevel} />
              <span className="chip">{dres.weightedScore.toFixed(2)} / 3.00</span>
            </div>
            <p className="small muted" style={{ marginTop: -4 }}>
              {domain.blurb} — {dres.counts.Low} Low · {dres.counts.Medium} Medium ·{' '}
              {dres.counts.High} High · {dres.counts['Need More Info']} Needs More Info ·{' '}
              {dres.counts['N/A']} N/A
            </p>
            {rows.map((m) => (
              <ModifierCard
                key={m.id}
                modifier={m}
                state={session.modifiers[m.id]}
                contributionPct={contribution(m.id, session.modifiers, allIds)}
                evidence={session.evidence}
                onOverride={(level) => onModifier(m.id, { override: level })}
                onWeight={(weight) => onModifier(m.id, { weight })}
                onNotes={(notes) => onModifier(m.id, { notes })}
                onAddEvidence={onAddEvidence}
                onRemoveEvidence={onRemoveEvidence}
              />
            ))}
          </section>
        )
      })}

      <div className="sticky-bar no-print">
        <div className="wrap">
          <button className="btn ghost" onClick={onBack}>
            ← Back to intake
          </button>
          <span className="small muted">
            Suggested overall:{' '}
            <RiskBadge level={det.suggestedOverall as ResponseValue} />
            {gapCount > 0 && ` · ${gapCount} still need more information`}
          </span>
          <span className="spacer" />
          <button className="btn lg" onClick={onContinue}>
            Review &amp; accept final determination →
          </button>
        </div>
      </div>
    </>
  )
}
