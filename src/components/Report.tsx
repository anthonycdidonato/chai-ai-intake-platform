import { Fragment } from 'react'
import { DOMAINS } from '../data/riskData'
import { packageName } from '../data/evidencePackages'
import { computeDetermination, confirmedLevel } from '../lib/scoring'
import { summarizeMitigations } from '../lib/mitigations'
import { downloadJson } from '../lib/report'
import { LevelBadge, levelClass } from './bits'
import type { Assessment } from '../lib/types'

export function Report({
  a,
  onBack,
}: {
  a: Assessment
  onBack: () => void
}) {
  const det = computeDetermination(a.modifiers)
  const { triggered, byPeak, unresolved } = summarizeMitigations(a.modifiers)
  const packages = Array.from(new Set(a.evidence.map((e) => e.packageId)))

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Risk review</div>
            <h2 style={{ margin: 0 }}>
              {a.solutionName || 'Unnamed solution'}
              {a.vendorName && <span className="muted"> · {a.vendorName}</span>}
            </h2>
            <p className="small muted" style={{ margin: '4px 0 0' }}>
              Reviewed by {a.reviewerName || 'unnamed reviewer'}
              {a.reviewerOrg && `, ${a.reviewerOrg}`} · {new Date(a.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="btn-row no-print">
            <button className="btn secondary" onClick={() => window.print()}>
              Print / save PDF
            </button>
            <button className="btn" onClick={() => downloadJson(a)}>
              Download JSON
            </button>
          </div>
        </div>

        <div className="summary-grid" style={{ marginTop: 20 }}>
          <div className={`stat risk-${levelClass(det.overall)}`}>
            <div className="k">Overall risk</div>
            <div className="v">{det.overall}</div>
          </div>
          {det.domains.map((d) => (
            <div key={d.domainId} className={`stat risk-${levelClass(d.level)}`}>
              <div className="k">{d.domainName}</div>
              <div className="v">{d.level}</div>
            </div>
          ))}
          <div className="stat risk-info">
            <div className="k">Controls to implement</div>
            <div className="v">{triggered.length}</div>
            <div className="tiny muted" style={{ marginTop: 6 }}>
              {byPeak.High} from High · {byPeak.Medium} from Medium · {byPeak.Low} from Low
            </div>
          </div>
        </div>

        {unresolved.length > 0 && (
          <div className="alert warn" style={{ marginTop: 18, marginBottom: 0 }}>
            <span aria-hidden="true">⚠</span>
            <span>
              This review is incomplete: {unresolved.length} modifier
              {unresolved.length === 1 ? '' : 's'} could not be answered from the documentation
              received, so controls behind {unresolved.length === 1 ? 'it' : 'them'} are not listed.
            </span>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Use case</h3>
        <p className="small" style={{ whiteSpace: 'pre-wrap' }}>
          {a.useCase}
        </p>
        <h3 style={{ marginTop: 22 }}>
          Documentation received — {a.evidence.length} document
          {a.evidence.length === 1 ? '' : 's'} across {packages.length} package
          {packages.length === 1 ? '' : 's'}
        </h3>
        {a.evidence.length === 0 ? (
          <p className="small muted">None recorded.</p>
        ) : (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Document</th>
                  <th>Evidence example</th>
                </tr>
              </thead>
              <tbody>
                {a.evidence.map((e) => (
                  <tr key={e.id}>
                    <td>{packageName(e.packageId)}</td>
                    <td>{e.name}</td>
                    <td className="muted">{e.example ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Risk categorization</h3>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>#</th>
                <th>Risk modifier</th>
                <th>CHAI suggested</th>
                <th>Confirmed</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {DOMAINS.map((domain) => (
                <Fragment key={domain.id}>
                  <tr>
                    <td colSpan={5} className="row-group">
                      {domain.name}
                    </td>
                  </tr>
                  {domain.modifiers.map((m) => {
                    const st = a.modifiers[m.id]
                    if (!st) return null
                    return (
                      <tr key={m.id}>
                        <td className="muted">{m.number}</td>
                        <td>{m.title}</td>
                        <td className="muted">{st.suggested}</td>
                        <td>
                          <LevelBadge level={confirmedLevel(st)} />
                        </td>
                        <td className="muted">{st.notes || '—'}</td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Mitigation controls to consider — {triggered.length}</h3>
        <p className="small muted">
          Ordered by urgency. Each control lists the confirmed risk modifiers that triggered it.
        </p>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mitigation</th>
                <th>Urgency</th>
                <th>Triggered by</th>
              </tr>
            </thead>
            <tbody>
              {triggered.map((t) => (
                <tr key={t.id}>
                  <td className="muted">{t.id}</td>
                  <td>
                    <strong>{t.name}</strong>
                    <div className="tiny muted print-desc">{t.description}</div>
                  </td>
                  <td>
                    <LevelBadge level={t.peak} />
                  </td>
                  <td className="tiny muted">
                    {t.reasons.map((r) => `${r.modifierNumber} ${r.modifierTitle} (${r.level})`).join('; ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card tight no-print">
        <p className="small muted" style={{ margin: 0 }}>
          Risk categorization follows the CHAI Risk Categorization Tool (v3). Mitigation controls
          are drawn from the CHAI Risk Mitigation Mapping library (v7, October 2026). This is a
          prototype — the determination is yours to make, not CHAI&apos;s.
        </p>
      </div>

      <div className="sticky-bar no-print">
        <div className="wrap">
          <button className="btn ghost" onClick={onBack}>
            ← Back to mitigations
          </button>
          <span className="spacer" />
          <button className="btn secondary" onClick={() => window.print()}>
            Print / save PDF
          </button>
          <button className="btn" onClick={() => downloadJson(a)}>
            Download JSON
          </button>
        </div>
      </div>
    </>
  )
}
