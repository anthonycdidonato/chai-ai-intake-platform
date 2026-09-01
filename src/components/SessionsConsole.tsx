import { useEffect, useState } from 'react'
import { computeDetermination } from '../lib/scoring'
import { deleteSession, listSessions, storeMode } from '../lib/store'
import { downloadJson } from '../lib/report'
import type { IntakeSession } from '../lib/types'
import { RiskBadge } from './ModifierCard'
import type { ResponseValue } from '../data/riskData'

export function SessionsConsole({
  onOpen,
  currentId,
}: {
  onOpen: (session: IntakeSession) => void
  currentId?: string
}) {
  const [sessions, setSessions] = useState<IntakeSession[] | null>(null)
  const [orgFilter, setOrgFilter] = useState('')

  async function refresh() {
    setSessions(await listSessions())
  }

  useEffect(() => {
    void refresh()
  }, [])

  const rows = (sessions ?? []).filter((s) =>
    orgFilter ? s.orgName.toLowerCase().includes(orgFilter.toLowerCase()) : true,
  )

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Session record</p>
          <h2>Saved intake sessions</h2>
          <p className="small muted" style={{ maxWidth: '82ch' }}>
            Every intake session is saved with its use case description, evidence manifest,
            per-modifier categorization, weights, and final determination, so that your
            organizational colleagues and CHAI administrators can review and reference it.
          </p>
        </div>
      </div>

      <div className="alert info">
        <span aria-hidden="true">🗄️</span>
        <span>
          {storeMode === 'rest' ? (
            <>
              Connected to the CHAI intake API. Sessions are read from and written to the shared
              database.
            </>
          ) : (
            <>
              <strong>Prototype storage:</strong> this public deployment has no server, so sessions
              are written to a database inside your own browser (IndexedDB) and never leave your
              device. Set <code>VITE_API_BASE_URL</code> to point the same calls at the reference
              backend in <code>/server</code>, which persists to a real shared database for
              organizational colleagues and CHAI administrators.
            </>
          )}
        </span>
      </div>

      <div className="btn-row" style={{ marginBottom: 14 }}>
        <input
          type="text"
          style={{ maxWidth: 280 }}
          placeholder="Filter by organization"
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
        />
        <button className="btn ghost sm" onClick={() => void refresh()}>
          Refresh
        </button>
        <span className="spacer" />
        <span className="small muted">
          {rows.length} session{rows.length === 1 ? '' : 's'}
        </span>
      </div>

      {sessions === null ? (
        <p className="small muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="small muted">
          No saved sessions yet. Start an intake and the session is saved automatically as you work.
        </p>
      ) : (
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Solution</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Suggested</th>
                <th>Final</th>
                <th>Open items</th>
                <th>Evidence</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const det = computeDetermination(s.modifiers)
                return (
                  <tr key={s.id} style={s.id === currentId ? { background: 'var(--blue-05)' } : undefined}>
                    <td>
                      <strong>{s.solutionName || '(unnamed solution)'}</strong>
                      <div className="tiny muted">
                        <code>{s.id.slice(0, 12)}</code>
                      </div>
                    </td>
                    <td>
                      {s.orgName || '—'}
                      <div className="tiny muted">
                        {s.orgType === 'vendor' ? 'Vendor' : 'Health delivery org'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'accepted' ? 'low' : 'na'} plain`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <RiskBadge level={det.suggestedOverall as ResponseValue} />
                    </td>
                    <td>
                      {s.finalOverall ? <RiskBadge level={s.finalOverall as ResponseValue} /> : '—'}
                    </td>
                    <td>{det.needsInfoCount}</td>
                    <td>{s.evidence.length}</td>
                    <td className="tiny">{new Date(s.updatedAt).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn secondary sm" onClick={() => onOpen(s)}>
                          Open
                        </button>
                        <button className="btn ghost sm" onClick={() => downloadJson(s)}>
                          JSON
                        </button>
                        <button
                          className="btn danger sm"
                          onClick={async () => {
                            if (!confirm(`Delete the session for "${s.solutionName || s.id}"? This cannot be undone.`)) return
                            await deleteSession(s.id)
                            void refresh()
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
