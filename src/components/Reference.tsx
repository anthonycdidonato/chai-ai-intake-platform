// Three reference tabs — a glossary, outside the workflow.

import { useState } from 'react'
import { DOMAINS } from '../data/riskData'
import { MITIGATIONS } from '../data/mitigations'
import { MITIGATION_DETAILS } from '../data/mitigationDetails'
import { KEY_TERMS } from '../data/keyTerms'

export type RefTab = 'modifiers' | 'mitigations' | 'terms'

const TABS: { key: RefTab; label: string }[] = [
  { key: 'modifiers', label: 'Risk modifiers' },
  { key: 'mitigations', label: 'Risk mitigations' },
  { key: 'terms', label: 'Key terms' },
]

export function Reference({ tab, onTab, onBack }: { tab: RefTab; onTab: (t: RefTab) => void; onBack: () => void }) {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const hit = (...parts: string[]) => !needle || parts.some((p) => p.toLowerCase().includes(needle))

  return (
    <>
      <div className="ref-head">
        <div>
          <div className="eyebrow">Reference</div>
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{TABS.find((t) => t.key === tab)!.label}</h1>
        </div>
        <button className="btn ghost sm" onClick={onBack}>← Back to assessment</button>
      </div>
      <div className="ref-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => { onTab(t.key); setQ('') }}>{t.label}</button>
        ))}
        <span className="spacer" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this tab" aria-label="Search" />
      </div>

      {tab === 'modifiers' && DOMAINS.map((d) => {
        const rows = d.modifiers.filter((m) => hit(m.title, m.description, m.definitions.Low, m.definitions.Medium, m.definitions.High))
        return rows.length === 0 ? null : (
          <section key={d.id} className="ref-section">
            <h2>{d.name}</h2>
            <p className="small muted">{d.blurb}</p>
            {rows.map((m) => (
              <div key={m.id} className="ref-item">
                <h3><span className="mod-num">{m.number}</span> {m.title}</h3>
                <p className="small">{m.description}</p>
                <dl className="ref-levels">
                  <div className="low"><dt>Low</dt><dd>{m.definitions.Low}</dd></div>
                  <div className="medium"><dt>Medium</dt><dd>{m.definitions.Medium}</dd></div>
                  <div className="high"><dt>High</dt><dd>{m.definitions.High}</dd></div>
                </dl>
              </div>
            ))}
          </section>
        )
      })}

      {tab === 'mitigations' && (
        <section className="ref-section">
          <p className="small muted">{MITIGATIONS.length} mitigations from the CHAI Risk Mitigation Mapping library. Expand one for detail.</p>
          {MITIGATIONS.filter((x) => { const d = MITIGATION_DETAILS[x.id]; return hit(x.id, x.name, x.description, d?.persona ?? '', d?.notes ?? '', d?.solutionTypes ?? '', d?.lifecycle ?? '', d?.responsible ?? '') }).map((x) => {
            const d = MITIGATION_DETAILS[x.id]
            return (
              <details key={x.id} className="ref-item ref-details">
                <summary><span className="mod-num">{x.id}</span><span className="mod-title">{x.name}</span><span className="tiny muted">{x.appliesAt.join(', ')}</span></summary>
                <p className="small">{x.description}</p>
                <dl className="ref-facts">
                  <dt>Risk level applied</dt><dd>{x.appliesAt.join(', ')}</dd>
                  <dt>Persona</dt><dd>{d?.persona || '—'}</dd>
                  <dt>Notes / examples</dt><dd>{d?.notes || '—'}</dd>
                  <dt>Types of AI solutions</dt><dd>{d?.solutionTypes || '—'}</dd>
                  <dt>Lifecycle stage</dt><dd>{d?.lifecycle || '—'}</dd>
                  <dt>Responsible party</dt><dd>{d?.responsible || '—'}</dd>
                </dl>
              </details>
            )
          })}
        </section>
      )}

      {tab === 'terms' && (
        <section className="ref-section">
          <p className="small muted">{KEY_TERMS.length} terms as used in the mitigation descriptions.</p>
          <dl className="ref-terms">
            {KEY_TERMS.filter((t) => hit(t.term, t.definition, t.reference)).map((t) => (
              <div key={t.term}>
                <dt>{t.term}</dt>
                <dd>{t.definition}{t.reference && <span className="tiny muted ref-cite">{t.reference}</span>}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  )
}
