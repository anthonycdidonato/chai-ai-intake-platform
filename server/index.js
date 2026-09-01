// ---------------------------------------------------------------------------
// Reference persistence backend for the CHAI AI Intake Platform.
//
// The public GitHub Pages build stores sessions in the browser (IndexedDB). When
// the platform is embedded in the CHAI Member Portal it needs a shared database
// so that an organization's colleagues and CHAI administrators can review the
// same records. Point the frontend at this server with:
//
//   VITE_API_BASE_URL=http://localhost:8787 npm run dev
//
// Run:  cd server && npm install && npm start
//
// Note on authorization: the member portal is the authentication boundary. This
// reference implementation trusts an `x-chai-org` header for the organization
// scope and `x-chai-admin: true` for administrator access; wire these to the
// portal's real session before deploying anywhere real.
// ---------------------------------------------------------------------------

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, 'data')
const PORT = Number(process.env.PORT ?? 8787)

fs.mkdirSync(DATA_DIR, { recursive: true })
const db = new Database(path.join(DATA_DIR, 'intake.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))

const app = express()
app.use(cors())
app.use(express.json({ limit: '4mb' }))

/** Organization scope + admin flag for the caller. */
function scope(req) {
  return {
    org: req.header('x-chai-org') ?? null,
    isAdmin: req.header('x-chai-admin') === 'true',
  }
}

const LEVEL_VALUE = { Low: 1, Medium: 2, High: 3 }

/** Derive the indexed columns from the session document. */
function summarize(session) {
  const states = Object.values(session.modifiers ?? {})
  let highest = 0
  let highCount = 0
  let needsInfo = 0
  let weightSum = 0
  let valueSum = 0

  for (const st of states) {
    const level = st.override ?? st.suggested
    if (level === 'Need More Info') needsInfo += 1
    if (level === 'High') highCount += 1
    const v = LEVEL_VALUE[level]
    if (!v) continue
    highest = Math.max(highest, v)
    const w = typeof st.weight === 'number' ? st.weight : 1
    if (w > 0) {
      weightSum += w
      valueSum += w * v
    }
  }

  const band = (n) => (n < 1.6667 ? 'Low' : n < 2.3334 ? 'Medium' : 'High')
  const chai = highest === 0 ? 'Need More Info' : highest === 3 ? 'High' : highest === 2 ? 'Medium' : 'Low'
  const weighted = weightSum > 0 ? band(valueSum / weightSum) : 'Low'
  const suggested =
    chai === 'Need More Info'
      ? 'Need More Info'
      : LEVEL_VALUE[chai] >= LEVEL_VALUE[weighted]
        ? chai
        : weighted

  return { suggested, highCount, needsInfo }
}

const upsertSession = db.prepare(`
  INSERT INTO sessions (
    id, org_name, org_type, solution_name, submitter_name, submitter_email, status,
    suggested_overall, final_overall, high_count, needs_info_count, evidence_count,
    created_at, updated_at, accepted_at, accepted_by, document
  ) VALUES (
    @id, @org_name, @org_type, @solution_name, @submitter_name, @submitter_email, @status,
    @suggested_overall, @final_overall, @high_count, @needs_info_count, @evidence_count,
    @created_at, @updated_at, @accepted_at, @accepted_by, @document
  )
  ON CONFLICT (id) DO UPDATE SET
    org_name = excluded.org_name,
    org_type = excluded.org_type,
    solution_name = excluded.solution_name,
    submitter_name = excluded.submitter_name,
    submitter_email = excluded.submitter_email,
    status = excluded.status,
    suggested_overall = excluded.suggested_overall,
    final_overall = excluded.final_overall,
    high_count = excluded.high_count,
    needs_info_count = excluded.needs_info_count,
    evidence_count = excluded.evidence_count,
    updated_at = excluded.updated_at,
    accepted_at = excluded.accepted_at,
    accepted_by = excluded.accepted_by,
    document = excluded.document
`)

const clearEvidence = db.prepare('DELETE FROM evidence WHERE session_id = ?')
const insertEvidence = db.prepare(`
  INSERT INTO evidence (id, session_id, package_id, example, file_name, file_type, file_size, added_during, uploaded_at)
  VALUES (@id, @session_id, @package_id, @example, @file_name, @file_type, @file_size, @added_during, @uploaded_at)
`)
const clearModifiers = db.prepare('DELETE FROM modifier_results WHERE session_id = ?')
const insertModifier = db.prepare(`
  INSERT INTO modifier_results (session_id, modifier_id, suggested_level, member_override, effective_level, weight, confidence, rationale, notes)
  VALUES (@session_id, @modifier_id, @suggested_level, @member_override, @effective_level, @weight, @confidence, @rationale, @notes)
`)

const writeSession = db.transaction((session) => {
  const s = summarize(session)
  upsertSession.run({
    id: session.id,
    org_name: session.orgName ?? '',
    org_type: session.orgType ?? 'hdo',
    solution_name: session.solutionName ?? '',
    submitter_name: session.submitterName ?? '',
    submitter_email: session.submitterEmail ?? '',
    status: session.status ?? 'draft',
    suggested_overall: s.suggested,
    final_overall: session.finalOverall ?? null,
    high_count: s.highCount,
    needs_info_count: s.needsInfo,
    evidence_count: session.evidence?.length ?? 0,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
    accepted_at: session.acceptedAt ?? null,
    accepted_by: session.acceptedBy ?? null,
    document: JSON.stringify(session),
  })

  clearEvidence.run(session.id)
  for (const f of session.evidence ?? []) {
    insertEvidence.run({
      id: f.id,
      session_id: session.id,
      package_id: f.packageId,
      example: f.example ?? null,
      file_name: f.name,
      file_type: f.type ?? null,
      file_size: f.size ?? null,
      added_during: f.addedDuring ?? null,
      uploaded_at: f.uploadedAt,
    })
  }

  clearModifiers.run(session.id)
  for (const [modifierId, st] of Object.entries(session.modifiers ?? {})) {
    insertModifier.run({
      session_id: session.id,
      modifier_id: modifierId,
      suggested_level: st.suggested ?? null,
      member_override: st.override ?? null,
      effective_level: st.override ?? st.suggested ?? null,
      weight: typeof st.weight === 'number' ? st.weight : 1,
      confidence: st.confidence ?? null,
      rationale: st.rationale ?? null,
      notes: st.notes ?? null,
    })
  }
})

app.get('/health', (_req, res) => res.json({ ok: true }))

// List sessions visible to the caller: their organization's, or all for admins.
app.get('/sessions', (req, res) => {
  const { org, isAdmin } = scope(req)
  const rows = isAdmin
    ? db.prepare('SELECT document FROM sessions ORDER BY updated_at DESC').all()
    : db
        .prepare('SELECT document FROM sessions WHERE org_name = ? ORDER BY updated_at DESC')
        .all(org ?? '')
  res.json(rows.map((r) => JSON.parse(r.document)))
})

app.get('/sessions/:id', (req, res) => {
  const { org, isAdmin } = scope(req)
  const row = db.prepare('SELECT org_name, document FROM sessions WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not found' })
  if (!isAdmin && org && row.org_name && row.org_name !== org) {
    return res.status(403).json({ error: 'forbidden' })
  }
  res.json(JSON.parse(row.document))
})

app.put('/sessions/:id', (req, res) => {
  const session = req.body
  if (!session?.id || session.id !== req.params.id) {
    return res.status(400).json({ error: 'session id mismatch' })
  }
  writeSession(session)
  res.json({ ok: true, id: session.id })
})

app.delete('/sessions/:id', (req, res) => {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// Aggregate view for CHAI administrators: which modifiers most often land High
// or come back needing more information across all member submissions.
app.get('/admin/modifier-stats', (req, res) => {
  if (!scope(req).isAdmin) return res.status(403).json({ error: 'admin only' })
  res.json(
    db
      .prepare(
        `SELECT modifier_id,
                SUM(effective_level = 'High')           AS high,
                SUM(effective_level = 'Medium')         AS medium,
                SUM(effective_level = 'Low')            AS low,
                SUM(effective_level = 'Need More Info') AS needs_info,
                COUNT(*)                                AS total,
                ROUND(AVG(weight), 2)                   AS avg_weight
           FROM modifier_results
          GROUP BY modifier_id
          ORDER BY high DESC`,
      )
      .all(),
  )
})

app.listen(PORT, () => {
  console.log(`CHAI AI Intake session API listening on http://localhost:${PORT}`)
  console.log(`Database: ${path.join(DATA_DIR, 'intake.db')}`)
})
