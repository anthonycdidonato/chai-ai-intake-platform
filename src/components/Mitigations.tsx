import { useEffect, useState } from 'react'
import { ALL_MODIFIERS } from '../data/riskData'
import { packageName } from '../data/evidencePackages'
import { summarize } from '../lib/scoring'
import { distinctMitigations, mitigationsByModifier } from '../lib/mitigations'
import { downloadJson, shareByEmail } from '../lib/report'
import { LevelBadge, levelClass } from './bits'
import type { Assessment } from '../lib/types'

export function Mitigations({ a, onBack }: { a: Assessment; onBack: () => void }) {
  const s = summarize(a.modifiers)
  const groups = mitigationsByModifier(a.modifiers)
  const distinct = distinctMitigations(groups)
  const open = ALL_MODIFIERS.filter((m) => !a.modifiers[m.id]?.selected)
  const [to, setTo] = useState('')
  const [allOpen, setAllOpen] = useState<boolean | null>(null)

  // Print every group expanded, then restore.
  useEffect(() => {
    const before = () => document.querySelectorAll<HTMLDetailsElement>('.mit-group').forEach((d) => { d.dataset.was = String(d.open); d.open = true })
    const after = () => document.querySelectorAll<HTMLDetailsElement>('.mit-group').forEach((d) => { d.open = d.dataset.was === 'true' })
    window.addEventListener('beforeprint', before); window.addEventListener('afterprint', after)
    return () => { window.removeEventListener('beforeprint', before); window.removeEventListener('afterprint', after) }
  }, [])

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Suggested mitigations</div>
            <h2 style={{ margin: '0 0 4px' }}>{a.solutionName} <LevelBadge level={s.overall} big /></h2>
            <p className="small muted" style={{ margin: 0 }}>
              {a.source === 'vendor' ? `Third-party vendor${a.vendorName ? ` · ${a.vendorName}` : ''}` : 'Internally developed'}
              {a.reviewerName && ` · reviewed by ${a.reviewerName}`}{a.orgName && `, ${a.orgName}`}
              {a.submittedAt && ` · ${new Date(a.submittedAt).toLocaleDateString()}`}
            </p>
          </div>
          <div className="btn-row no-print">
            <button className="btn secondary" onClick={() => window.print()}>Download PDF</button>
            <button className="btn secondary" onClick={() => downloadJson(a)}>Download JSON</button>
          </div>
        </div>
        <div className="summary-grid" style={{ marginTop: 18 }}>
          {s.domains.map((d) => (
            <div key={d.id} className={`stat risk-${levelClass(d.level)}`}><div className="k">{d.name}</div><div className="v">{d.level ?? '—'}</div></div>
          ))}
          <div className="stat risk-info"><div className="k">Mitigations to consider</div><div className="v">{distinct}</div>
            <div className="tiny muted" style={{ marginTop: 6 }}>distinct, across {groups.length} modifier{groups.length === 1 ? '' : 's'}</div></div>
        </div>
        <div className="share no-print">
          <label htmlFor="to" style={{ marginBottom: 0 }}>Share with your team</label>
          <input id="to" type="email" multiple value={to} placeholder="colleague@yourorg.org, another@yourorg.org" onChange={(e) => setTo(e.target.value)} />
          <button className="btn" onClick={() => shareByEmail(a, to)} disabled={!to.trim()}>Email summary</button>
        </div>
      </div>

      {open.length > 0 && (
        <div className="alert warn">
          <span aria-hidden="true">⚠</span>
          <span><strong>{open.length} modifier{open.length === 1 ? '' : 's'} left open</strong> — no mitigations are listed for {open.length === 1 ? 'it' : 'them'} until a level is selected:{' '}
            {open.map((m) => `${m.number} ${m.title}`).join('; ')}.
            {open.some((m) => !a.modifiers[m.id]?.sufficient) && <> Request: {Array.from(new Set(open.flatMap((m) => a.modifiers[m.id]?.missingEvidence ?? []))).map(packageName).join(', ')}.</>}
          </span>
        </div>
      )}

      <div className="filter-bar no-print">
        <span className="small muted">Expand a modifier to see its suggested mitigations.</span>
        <span className="spacer" />
        <button className="linkish tiny" onClick={() => setAllOpen(true)}>Expand all</button>
        <button className="linkish tiny" onClick={() => setAllOpen(false)}>Collapse all</button>
      </div>

      {groups.map((g) => (
        <details key={`${g.modifierId}-${allOpen}`} className={`mit-group lv-${levelClass(g.level)}`} open={allOpen ?? false}>
          <summary>
            <span className="mod-num">{g.number}</span>
            <span className="mod-title">{g.title}</span>
            <span className="mod-right"><span className="tiny muted">{g.mitigations.length} mitigation{g.mitigations.length === 1 ? '' : 's'}</span><LevelBadge level={g.level} /></span>
          </summary>
          {g.mitigations.length === 0
            ? <p className="small muted" style={{ padding: '0 16px 14px' }}>No mitigations in the CHAI library are mapped to this modifier at {g.level}.</p>
            : <ol className="mit-list">{g.mitigations.map((x) => <li key={x.id}><strong>{x.name}</strong><p>{x.description}</p></li>)}</ol>}
        </details>
      ))}

      <div className="sticky-bar no-print">
        <div className="wrap">
          <button className="btn ghost" onClick={onBack}>← Change risk levels</button>
          <span className="spacer" />
          <button className="btn secondary" onClick={() => window.print()}>Download PDF</button>
          <button className="btn" onClick={() => downloadJson(a)}>Download JSON</button>
        </div>
      </div>
    </>
  )
}
