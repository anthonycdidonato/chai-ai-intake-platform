import type { Step } from '../lib/types'

const STEPS: { key: Step; label: string; caption: string }[] = [
  { key: 'intake', label: 'Intake', caption: 'Describe and upload documentation' },
  { key: 'levels', label: 'Risk levels', caption: 'Confirm a level for each modifier' },
  { key: 'mitigations', label: 'Mitigations', caption: 'What to put in place' },
]

export function SiteHeader({ onRestart, onSave, saved, started, onReference, inReference }: { onRestart: () => void; onSave: () => void; saved: boolean; started: boolean; onReference: () => void; inReference: boolean }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <span key={i} />)}</span>
          <span>CHAI AI Intake</span>
        </div>
        <div className="header-nav">
          <button onClick={onReference} aria-current={inReference}>Reference</button>
          {started && !inReference && <button onClick={onSave}>{saved ? 'Saved ✓' : 'Save for later'}</button>}
          {started && !inReference && <button onClick={onRestart}>Start over</button>}
        </div>
      </div>
    </header>
  )
}

export function Stepper({ step, reachable, onGo }: { step: Step; reachable: Step[]; onGo: (s: Step) => void }) {
  const active = STEPS.findIndex((s) => s.key === step)
  return (
    <div className="stepper">
      <div className="wrap">
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.key} className={i < active ? 'done' : i === active ? 'active' : ''}>
              <button className="step-btn" onClick={() => onGo(s.key)} disabled={!reachable.includes(s.key)} aria-current={i === active}>
                <span className="dot">{i < active ? '✓' : i + 1}</span>
                <span className="step-text"><span className="step-label">{s.label}</span><span className="step-caption">{s.caption}</span></span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="footer no-print">
      <div className="wrap">
        <p style={{ margin: 0 }}>
          Risk modifiers from the <strong>CHAI Risk Categorization Tool (v3)</strong>; mitigations from the{' '}
          <strong>CHAI Risk Mitigation Mapping</strong> library. Documents are described, never transmitted — everything stays in this browser.
        </p>
      </div>
    </footer>
  )
}
