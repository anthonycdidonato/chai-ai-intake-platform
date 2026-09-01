import { useState } from 'react'
import { ALL_MODIFIERS, DOMAINS, type ResponseValue, type RiskLevel } from '../data/riskData'
import { packageName } from '../data/evidencePackages'
import { effectiveLevel } from '../lib/inference'
import { computeDetermination, contribution } from '../lib/scoring'
import { downloadJson, shareByEmail } from '../lib/report'
import { storeMode } from '../lib/store'
import type { IntakeSession } from '../lib/types'
import { RiskBadge } from './ModifierCard'
import { OverallSummary } from './ResultsReview'
import { MoreToCome } from './MoreToCome'
import { formatBytes } from './EvidenceUploader'

interface Props {
  session: IntakeSession
  onAccept: (level: RiskLevel, note: string, by: string) => void
  onBack: () => void
  onNewSession: () => void
}

export function ReportView({ session, onAccept, onBack, onNewSession }: Props) {
  const det = computeDetermination(session.modifiers)
  const allIds = ALL_MODIFIERS.map((m) => m.id)
  const [choice, setChoice] = useState<RiskLevel>(
    session.finalOverall ??
      (det.suggestedOverall === 'Need More Info' ? 'High' : det.suggestedOverall),
  )
  const [note, setNote] = useState(session.finalNote ?? '')
  const [by, setBy] = useState(session.acceptedBy ?? session.submitterName)
  const [recipients, setRecipients] = useState('')
  const accepted = session.status === 'accepted'

  return (
    <>
      <div className="card">
        <p className="eyebrow">Step 4 of 4</p>
        <h2>Final risk determination</h2>
        <div className="grid-2" style={{ marginBottom: 14 }}>
          <div>
            <p className="small muted" style={{ margin: 0 }}>
              <strong>Solution:</strong> {session.solutionName || '—'}
              <br />
              <strong>Organization:</strong> {session.orgName || '—'} (
              {session.orgType === 'vendor'
                ? 'Technology vendor'
                : 'Healthcare delivery organization'}
              )<br />
              <strong>Submitted by:</strong> {session.submitterName || '—'}
              {session.submitterEmail ? ` · ${session.submitterEmail}` : ''}
            </p>
          </div>
          <div>
            <p className="small muted" style={{ margin: 0 }}>
              <strong>Session:</strong> <code>{session.id}</code>
              <br />
              <strong>Created:</strong> {new Date(session.createdAt).toLocaleString()}
              <br />
              <strong>Evidence on file:</strong> {session.evidence.length} document
              {session.evidence.length === 1 ? '' : 's'} across{' '}
              {new Set(session.evidence.map((f) => f.packageId)).size} packages
            </p>
          </div>
        </div>
        <OverallSummary session={session} />
      </div>

      {det.needsInfoCount > 0 && !accepted && (
        <div className="alert warn no-print">
          <span aria-hidden="true">⚠️</span>
          <span>
            <strong>
              {det.needsInfoCount} modifier{det.needsInfoCount === 1 ? '' : 's'} still flagged Needs
              More Information.
            </strong>{' '}
            You can accept a determination now, but the record will note the open items. Going back
            to add the missing evidence produces a stronger determination.{' '}
            <button className="btn ghost sm" onClick={onBack}>
              Back to categorization
            </button>
          </span>
        </div>
      )}

      <div className="card">
        <h3>{accepted ? 'Accepted determination' : 'Accept the final determination'}</h3>
        {accepted ? (
          <div className="alert ok" style={{ marginBottom: 0 }}>
            <span aria-hidden="true">✓</span>
            <span>
              <strong>{session.finalOverall}</strong> risk accepted by{' '}
              {session.acceptedBy || 'a colleague'} on{' '}
              {session.acceptedAt ? new Date(session.acceptedAt).toLocaleString() : '—'}.
              {session.finalNote && (
                <>
                  <br />
                  <em>{session.finalNote}</em>
                </>
              )}
            </span>
          </div>
        ) : (
          <>
            <p className="small muted" style={{ maxWidth: '80ch' }}>
              The platform suggests{' '}
              <strong>
                {det.suggestedOverall === 'Need More Info' ? 'more information' : det.suggestedOverall}
              </strong>
              . The determination is yours to make — record what your organization is accepting and
              why.
            </p>
            <div className="field" style={{ maxWidth: 460 }}>
              <label>Final overall risk categorization</label>
              <div className="seg">
                {(['Low', 'Medium', 'High'] as RiskLevel[]).map((lv) => (
                  <button
                    key={lv}
                    className={lv.toLowerCase()}
                    aria-pressed={choice === lv}
                    onClick={() => setChoice(lv)}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="acceptby">Accepted by</label>
                <input
                  id="acceptby"
                  type="text"
                  value={by}
                  placeholder="Your name"
                  onChange={(e) => setBy(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="acceptnote">Determination note (optional)</label>
                <input
                  id="acceptnote"
                  type="text"
                  value={note}
                  placeholder="e.g. Accepted at Medium; monitoring plan required before go-live."
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            <button className="btn lg" onClick={() => onAccept(choice, note, by)}>
              Accept {choice} risk as final
            </button>
          </>
        )}
      </div>

      <div className="card no-print">
        <h3>Download &amp; share</h3>
        <p className="small muted" style={{ maxWidth: '80ch' }}>
          The report includes the use case description, the full evidence manifest, every
          modifier-level suggestion with its rationale and confidence, your overrides, the weights
          you set, and the accepted determination.
        </p>
        <div className="btn-row" style={{ marginBottom: 18 }}>
          <button className="btn" onClick={() => downloadJson(session)}>
            ⬇ Download JSON
          </button>
          <button className="btn secondary" onClick={() => window.print()}>
            ⬇ Download PDF
          </button>
          <span className="tiny muted">
            PDF uses your browser's print dialog — choose "Save as PDF".
          </span>
        </div>
        <div className="grid-2">
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="share">Share with colleagues by email</label>
            <input
              id="share"
              type="text"
              value={recipients}
              placeholder="colleague@organization.org, governance@organization.org"
              onChange={(e) => setRecipients(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn secondary"
              disabled={!recipients.trim()}
              onClick={() => shareByEmail(session, recipients)}
            >
              ✉ Compose email
            </button>
          </div>
        </div>
        <p className="tiny muted" style={{ marginTop: 12, marginBottom: 0 }}>
          This session is saved{' '}
          {storeMode === 'rest'
            ? 'to the CHAI Member Portal database, where your organizational colleagues and CHAI administrators can review it.'
            : 'in this browser’s local database for the prototype. In the Member Portal it is written to the shared database visible to your organizational colleagues and CHAI administrators.'}{' '}
          Find it again under <strong>Saved sessions</strong>.
        </p>
      </div>

      <div className="card">
        <h3>Risk modifier detail</h3>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>#</th>
                <th>Risk modifier</th>
                <th>Suggested</th>
                <th>Final</th>
                <th>Weight</th>
                <th>Share of overall</th>
                <th>Confidence</th>
                <th>Evidence on file</th>
              </tr>
            </thead>
            <tbody>
              {DOMAINS.map((domain) => [
                <tr key={domain.id}>
                  <td colSpan={8} style={{ background: 'var(--blue-10)', fontWeight: 600 }}>
                    {domain.name}
                  </td>
                </tr>,
                ...domain.modifiers.map((m) => {
                  const st = session.modifiers[m.id]
                  const lv = effectiveLevel(st)
                  return (
                    <tr key={m.id}>
                      <td>{m.number}</td>
                      <td>{m.title}</td>
                      <td>
                        <RiskBadge level={st.suggested} />
                      </td>
                      <td>
                        <RiskBadge level={lv} />
                        {st.override && (
                          <div className="tiny muted">member override</div>
                        )}
                      </td>
                      <td>{st.weight.toFixed(2)}</td>
                      <td>
                        {lv === 'Need More Info' || lv === 'N/A'
                          ? '—'
                          : `${contribution(m.id, session.modifiers, allIds).toFixed(1)}%`}
                      </td>
                      <td>{st.confidence}</td>
                      <td className="tiny">
                        {st.supportingEvidence.length
                          ? st.supportingEvidence.map(packageName).join('; ')
                          : '—'}
                      </td>
                    </tr>
                  )
                }),
              ])}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Evidence manifest</h3>
        {session.evidence.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>
            No evidence was attached to this session.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>Evidence package</th>
                  <th>Document</th>
                  <th>Size</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {session.evidence.map((f) => (
                  <tr key={f.id}>
                    <td>{packageName(f.packageId)}</td>
                    <td>{f.name}</td>
                    <td>{formatBytes(f.size)}</td>
                    <td className="tiny">
                      {new Date(f.uploadedAt).toLocaleString()}
                      <br />
                      during {f.addedDuring}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card print-only">
        <h3>Use case description</h3>
        <p className="small">{session.useCase}</p>
      </div>

      <MoreToCome session={session} />

      <div className="sticky-bar no-print">
        <div className="wrap">
          <button className="btn ghost" onClick={onBack}>
            ← Back to categorization
          </button>
          <span className="spacer" />
          <span className="small muted">
            Final:{' '}
            {session.finalOverall ? (
              <RiskBadge level={session.finalOverall as ResponseValue} />
            ) : (
              'not yet accepted'
            )}
          </span>
          <button className="btn secondary" onClick={onNewSession}>
            Start another intake
          </button>
        </div>
      </div>
    </>
  )
}
