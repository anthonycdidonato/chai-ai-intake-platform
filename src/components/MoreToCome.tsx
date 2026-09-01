import { computeDetermination } from '../lib/scoring'
import type { IntakeSession } from '../lib/types'

export function MoreToCome({ session }: { session: IntakeSession }) {
  const det = computeDetermination(session.modifiers)
  const level = session.finalOverall ?? (det.suggestedOverall === 'Need More Info' ? null : det.suggestedOverall)

  return (
    <div className="more-to-come">
      <p className="eyebrow">More to come</p>
      <h2>Next: risk mitigation controls</h2>
      <p style={{ maxWidth: '82ch' }}>
        The next component of this platform will turn the determination above into a concrete set of
        <strong> mitigation controls</strong>, triggered by the risk level at both the overall and
        the individual risk modifier level — so a single High modifier pulls in its own controls even
        when the overall solution is Medium.
      </p>

      <div className="next-grid">
        <div className="next-card">
          <span className="tag">Use case level</span>
          <h3 style={{ fontSize: '1rem', margin: '4px 0 6px' }}>Operational controls</h3>
          <p className="small muted" style={{ margin: 0 }}>
            Human-in-the-loop requirements, monitoring cadence and thresholds, drift and bias review
            schedules, escalation and shutdown runbooks, user training and disclosure practices.
          </p>
        </div>
        <div className="next-card">
          <span className="tag">Use case level</span>
          <h3 style={{ fontSize: '1rem', margin: '4px 0 6px' }}>Contractual controls</h3>
          <p className="small muted" style={{ margin: 0 }}>
            SLA and performance-reporting terms, notification obligations, audit and access rights,
            indemnification, data use and retention limits, model-change and version notice.
          </p>
        </div>
        <div className="next-card">
          <span className="tag">Organizational level</span>
          <h3 style={{ fontSize: '1rem', margin: '4px 0 6px' }}>Governance controls</h3>
          <p className="small muted" style={{ margin: 0 }}>
            Committee review thresholds, approval authority by risk tier, inventory and registration
            requirements, re-review triggers, incident reporting lines, and role accountability.
          </p>
        </div>
      </div>

      <div className="alert info" style={{ marginTop: 18, marginBottom: 0 }}>
        <span aria-hidden="true">🔎</span>
        <span>
          {level ? (
            <>
              Based on this session's <strong>{level}</strong> determination
              {det.highCount > 0 && (
                <>
                  {' '}
                  and its <strong>{det.highCount} High</strong> modifier
                  {det.highCount === 1 ? '' : 's'}
                </>
              )}
              , the {level.toLowerCase()}-tier control set would be triggered, plus the
              modifier-specific controls for each High and Medium modifier above.
            </>
          ) : (
            <>
              Resolve the modifiers still flagged <em>Needs More Information</em> and the platform
              will be able to name the exact control set this solution triggers.
            </>
          )}{' '}
          This is the phase after risk categorization in CHAI's risk lifecycle: Categorization →
          Assessment → <strong>Mitigation</strong> → Monitoring.
        </span>
      </div>
    </div>
  )
}
