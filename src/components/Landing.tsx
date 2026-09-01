import { EVIDENCE_PACKAGES, TIER_LABELS, TIER_ORDER } from '../data/evidencePackages'
import { DOMAINS, TOTAL_MODIFIERS } from '../data/riskData'

export function Landing({ onStart, onResume, resumable }: {
  onStart: () => void
  onResume: () => void
  resumable: boolean
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true">
          {Array.from({ length: 40 }, (_, i) => (
            <span key={i} style={{ opacity: (i * 37) % 5 === 0 ? 0 : 1 }} />
          ))}
        </div>
        <p className="eyebrow" style={{ color: 'var(--light-blue)' }}>
          CHAI Member Portal
        </p>
        <h1>Hello, I'm CHAI's AI Intake Platform.</h1>
        <p className="lede">
          Describe your use case and upload relevant evidence — documents and artifacts such as a
          business associate agreement, CHAI Applied Model Card, workflow diagrams, and more. Once
          the use case has been described and evidence uploaded, CHAI will offer a suggested risk
          categorization (Low, Medium, or High) at the level of the overall AI solution and at each
          of the individual risk modifier levels, leveraging CHAI's Risk Categorization Tool.
        </p>
        <p className="lede">
          You can update the weight of the individual risk modifiers while reviewing the suggested
          risk categorization, and see the effect in real time, before making a final risk
          determination.
        </p>
        <div className="privacy-note">
          <span aria-hidden="true" style={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
            🔒
          </span>
          <span>
            <strong>Important note:</strong> All information — use case description, evidence, and
            risk — will be private only to your organizational colleagues in CHAI's member portal
            and CHAI administrators.
          </span>
        </div>
        <div className="btn-row" style={{ marginTop: 24 }}>
          <button className="btn lg" onClick={onStart} style={{ background: 'var(--white)', color: 'var(--dark-blue)' }}>
            Start a new intake →
          </button>
          {resumable && (
            <button
              className="btn lg secondary"
              onClick={onResume}
              style={{ background: 'transparent', color: 'var(--white)', borderColor: 'rgba(255,255,255,.6)' }}
            >
              Resume my last session
            </button>
          )}
        </div>
      </section>

      <div className="card">
        <p className="eyebrow">How it works</p>
        <h2>Four steps, and you can add evidence at any point</h2>
        <div className="next-grid">
          {[
            {
              n: '1',
              t: 'Describe & upload',
              d: 'Tell us about the AI solution and attach whatever evidence you have. Partial evidence is fine — the platform will tell you exactly what is missing.',
            },
            {
              n: '2',
              t: 'Generate categorization',
              d: `The platform categorizes risk across all ${TOTAL_MODIFIERS} CHAI risk modifiers in two domains, and flags anything it cannot answer as "Needs More Information."`,
            },
            {
              n: '3',
              t: 'Review & weight',
              d: 'Fill the gaps inline, override any suggestion, and adjust modifier weights to see the overall risk move in real time.',
            },
            {
              n: '4',
              t: 'Accept & share',
              d: 'Accept the final determination, then download it as JSON or PDF, or share it with colleagues by email.',
            },
          ].map((s) => (
            <div className="next-card" key={s.n}>
              <span className="tag">Step {s.n}</span>
              <h3 style={{ marginTop: 4, marginBottom: 6, fontSize: '1rem' }}>{s.t}</h3>
              <p className="small muted" style={{ margin: 0 }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <p className="eyebrow">What gets categorized</p>
          <h2>{TOTAL_MODIFIERS} risk modifiers, two domains</h2>
          {DOMAINS.map((d) => (
            <div key={d.id} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.98rem', marginBottom: 2 }}>
                {d.name}{' '}
                <span className="badge info plain">{d.modifiers.length} modifiers</span>
              </h3>
              <p className="small muted" style={{ marginBottom: 6 }}>
                {d.blurb}
              </p>
              <ul className="example-list">
                {d.modifiers.map((m) => (
                  <li key={m.id}>
                    {m.number} · {m.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="card">
          <p className="eyebrow">What to bring</p>
          <h2>Evidence packages</h2>
          <p className="small muted">
            Each package accepts one or more documents. You don't need all of them to start — core
            packages are requested of every vendor, and the medium and high tiers are triggered by
            the risk levels the categorization produces.
          </p>
          {TIER_ORDER.map((tier) => (
            <div key={tier} style={{ marginBottom: 14 }}>
              <h4 style={{ marginBottom: 6 }}>
                <span className={`badge tier-${tier} plain`}>{TIER_LABELS[tier]}</span>
              </h4>
              <ul className="example-list">
                {EVIDENCE_PACKAGES.filter((p) => p.tier === tier).map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
