import { useState } from 'react'
import { DOMAINS, type RiskLevel, type RiskModifier } from '../data/riskData'
import { packageName } from '../data/evidencePackages'
import { summarize } from '../lib/scoring'
import { LevelBadge, levelClass } from './bits'
import type { Assessment, ModifierState } from '../lib/types'

const CHOICES: (RiskLevel | 'N/A')[] = ['Low', 'Medium', 'High', 'N/A']

export function Levels({ a, onSelect, onBack, onSubmit }: {
  a: Assessment
  onSelect: (id: string, level: RiskLevel | 'N/A' | undefined) => void
  onBack: () => void
  onSubmit: () => void
}) {
  const s = summarize(a.modifiers)
  return (
    <>
      <div className="card">
        <div className="eyebrow">Suggested risk levels</div>
        <h2 style={{ margin: '0 0 6px' }}>{a.solutionName} <LevelBadge level={s.overall} big /></h2>
        <p className="small muted" style={{ margin: 0, maxWidth: '66ch' }}>
          Overall risk is the highest level selected — CHAI doesn&apos;t average modifiers. Where the documentation supports it, a level is
          suggested and pre-selected; change any you disagree with. Where it doesn&apos;t, the modifier is flagged and tells you what to request.
        </p>
        <div className="summary-grid" style={{ marginTop: 18 }}>
          {s.domains.map((d) => (
            <div key={d.id} className={`stat risk-${levelClass(d.level)}`}><div className="k">{d.name}</div><div className="v">{d.level ?? '—'}</div></div>
          ))}
          <div className={`stat risk-${s.insufficient ? 'medium' : 'low'}`}>
            <div className="k">Insufficient evidence</div><div className="v">{s.insufficient} <span className="tiny muted">of 19</span></div>
          </div>
        </div>
      </div>

      {s.insufficient > 0 && (
        <div className="alert warn">
          <span aria-hidden="true">⚠</span>
          <span><strong>{s.insufficient} modifier{s.insufficient === 1 ? '' : 's'} can&apos;t be answered from the documentation uploaded.</strong>{' '}
            Request the documents listed on each before making a final selection. You can still select a level yourself if you already know it, or leave it unselected.</span>
        </div>
      )}

      {DOMAINS.map((domain) => (
        <section key={domain.id}>
          <div className="domain-head"><h2>{domain.name}</h2><LevelBadge level={s.domains.find((d) => d.id === domain.id)?.level} /></div>
          {domain.modifiers.map((m) => <Row key={m.id} m={m} st={a.modifiers[m.id]} onSelect={(l) => onSelect(m.id, l)} />)}
        </section>
      ))}

      <div className="sticky-bar no-print">
        <div className="wrap">
          <button className="btn ghost" onClick={onBack}>← Back to intake</button>
          <span className="spacer" />
          <span className="small muted">{s.selected} of 19 selected{s.unselected ? ` · ${s.unselected} left open` : ''}</span>
          <button className="btn lg" onClick={onSubmit} disabled={s.selected === 0}>Submit and see mitigations →</button>
        </div>
      </div>
    </>
  )
}

function Row({ m, st, onSelect }: { m: RiskModifier; st: ModifierState | undefined; onSelect: (l: RiskLevel | 'N/A' | undefined) => void }) {
  const [open, setOpen] = useState(false)
  if (!st) return null
  const cls = st.selected ? levelClass(st.selected) : st.sufficient ? 'na' : 'needsinfo'
  return (
    <div className={`mod lv-${cls}`}>
      <div className="mod-head static">
        <span className="mod-num">{m.number}</span>
        <span className="mod-main">
          <span className="mod-title">{m.title}</span>
          <span className="tiny muted mod-desc">{m.description}</span>
          {st.sufficient
            ? <span className="small rationale-line"><strong>Suggested {st.suggested}.</strong> {st.rationale}</span>
            : <span className="small rationale-line insufficient"><strong>Insufficient evidence.</strong> Request: {st.missingEvidence.map(packageName).join(', ')}.</span>}
          <button className="linkish tiny" onClick={() => setOpen((o) => !o)}>{open ? 'Hide' : 'Show'} CHAI definitions</button>
        </span>
        <span className="mod-right">
          <div className="seg">
            {CHOICES.map((c) => (
              <button key={c} className={c.toLowerCase().replace(/[^a-z]/g, '')} aria-pressed={st.selected === c} onClick={() => onSelect(st.selected === c ? undefined : c)}>{c}</button>
            ))}
          </div>
        </span>
      </div>
      {open && (
        <div className="mod-body"><div className="defs" style={{ marginTop: 14 }}>
          {(['Low', 'Medium', 'High'] as const).map((lv) => (
            <button key={lv} className={`def ${lv.toLowerCase()}${st.selected === lv ? ' selected' : ''}`} onClick={() => onSelect(lv)} aria-pressed={st.selected === lv}>
              <h5>{lv}</h5>{m.definitions[lv]}
            </button>
          ))}
        </div></div>
      )}
    </div>
  )
}
