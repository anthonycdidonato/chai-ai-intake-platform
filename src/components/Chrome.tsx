import type { Step } from '../lib/types'

const STEPS: { key: Step; label: string; caption: string }[] = [
  { key: 'describe', label: 'Describe', caption: 'Use case and vendor documentation' },
  { key: 'categorize', label: 'Categorize', caption: 'Confirm risk at each modifier' },
  { key: 'mitigate', label: 'Mitigate', caption: 'Controls your risk profile calls for' },
  { key: 'report', label: 'Report', caption: 'Review and export' },
]

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} />
      ))}
    </span>
  )
}

export function SiteHeader({ onRestart, started }: { onRestart: () => void; started: boolean }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <div className="brand">
          <BrandMark />
          <span>CHAI AI Intake</span>
        </div>
        {started && (
          <div className="header-nav">
            <button onClick={onRestart}>Start over</button>
          </div>
        )}
      </div>
    </header>
  )
}

export function Stepper({
  step,
  reachable,
  onGo,
}: {
  step: Step
  reachable: Step[]
  onGo: (s: Step) => void
}) {
  const activeIndex = STEPS.findIndex((s) => s.key === step)
  return (
    <div className="stepper">
      <div className="wrap">
        <ol>
          {STEPS.map((s, i) => {
            const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : ''
            const can = reachable.includes(s.key)
            return (
              <li key={s.key} className={state}>
                <button
                  className="step-btn"
                  onClick={() => can && onGo(s.key)}
                  disabled={!can}
                  aria-current={i === activeIndex}
                >
                  <span className="dot">{i < activeIndex ? '✓' : i + 1}</span>
                  <span className="step-text">
                    <span className="step-label">{s.label}</span>
                    <span className="step-caption">{s.caption}</span>
                  </span>
                </button>
              </li>
            )
          })}
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
          Risk categorization follows the{' '}
          <strong>CHAI Risk Categorization Tool (v3)</strong>; mitigation controls come from the{' '}
          <strong>CHAI Risk Mitigation Mapping</strong> library. Everything you enter stays in this
          browser — nothing is transmitted.
        </p>
      </div>
    </footer>
  )
}
