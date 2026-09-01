// Site header, workflow stepper, and footer.

export type View = 'home' | 'intake' | 'review' | 'report' | 'admin'

const STEPS: { key: View; label: string }[] = [
  { key: 'home', label: 'Overview' },
  { key: 'intake', label: 'Describe & upload' },
  { key: 'review', label: 'Review categorization' },
  { key: 'report', label: 'Accept & share' },
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

export function SiteHeader({
  view,
  onNavigate,
  hasSession,
}: {
  view: View
  onNavigate: (v: View) => void
  hasSession: boolean
}) {
  return (
    <header className="site-header">
      <div className="wrap">
        <div className="brand">
          <BrandMark />
          <span>CHAI AI Intake Platform</span>
        </div>
        <nav className="header-nav" aria-label="Main">
          <button onClick={() => onNavigate('home')} aria-current={view === 'home'}>
            Overview
          </button>
          <button onClick={() => onNavigate('intake')} aria-current={view === 'intake'}>
            Intake
          </button>
          <button
            onClick={() => onNavigate('review')}
            aria-current={view === 'review'}
            disabled={!hasSession}
          >
            Categorization
          </button>
          <button onClick={() => onNavigate('admin')} aria-current={view === 'admin'}>
            Saved sessions
          </button>
        </nav>
      </div>
    </header>
  )
}

export function Stepper({ view }: { view: View }) {
  if (view === 'admin') return null
  const activeIndex = STEPS.findIndex((s) => s.key === view)
  return (
    <div className="stepper">
      <div className="wrap">
        <ol>
          {STEPS.map((s, i) => (
            <li
              key={s.key}
              className={i < activeIndex ? 'done' : i === activeIndex ? 'active' : ''}
            >
              <span className="dot">{i < activeIndex ? '✓' : i + 1}</span>
              {s.label}
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
          <strong>CHAI AI Intake Platform</strong> — prototype for the CHAI Member Portal. Risk
          categorization logic is derived from the{' '}
          <em>Coalition for Health AI (CHAI) Risk Categorization Tool (v3)</em>. All information
          entered here — use case description, evidence, and risk — is private to your
          organizational colleagues in CHAI's member portal and CHAI administrators.
        </p>
      </div>
    </footer>
  )
}
