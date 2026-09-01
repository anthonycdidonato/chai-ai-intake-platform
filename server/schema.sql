-- CHAI AI Intake Platform — session record
--
-- One row per intake session. The full session document is kept as JSON so the
-- shape can evolve with the risk tool, while the columns that CHAI
-- administrators filter and report on are promoted for indexing.

CREATE TABLE IF NOT EXISTS sessions (
  id                TEXT PRIMARY KEY,
  org_name          TEXT NOT NULL DEFAULT '',
  org_type          TEXT NOT NULL DEFAULT 'hdo',   -- 'hdo' | 'vendor'
  solution_name     TEXT NOT NULL DEFAULT '',
  submitter_name    TEXT NOT NULL DEFAULT '',
  submitter_email   TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'categorized' | 'accepted'
  suggested_overall TEXT,                          -- Low | Medium | High | Need More Info
  final_overall     TEXT,                          -- Low | Medium | High
  high_count        INTEGER NOT NULL DEFAULT 0,
  needs_info_count  INTEGER NOT NULL DEFAULT 0,
  evidence_count    INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  accepted_at       TEXT,
  accepted_by       TEXT,
  document          TEXT NOT NULL                  -- full IntakeSession as JSON
);

CREATE INDEX IF NOT EXISTS idx_sessions_org     ON sessions (org_name);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status  ON sessions (status);

-- Evidence manifest, denormalized for admin reporting on what members supply.
CREATE TABLE IF NOT EXISTS evidence (
  id           TEXT PRIMARY KEY,
  session_id   TEXT NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  package_id   TEXT NOT NULL,
  example      TEXT,
  file_name    TEXT NOT NULL,
  file_type    TEXT,
  file_size    INTEGER,
  added_during TEXT,                                -- 'intake' | 'review'
  uploaded_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_session ON evidence (session_id);
CREATE INDEX IF NOT EXISTS idx_evidence_package ON evidence (package_id);

-- Per-modifier determination, one row per risk modifier per session, so CHAI can
-- report on which modifiers most often come back High or need more information.
CREATE TABLE IF NOT EXISTS modifier_results (
  session_id      TEXT NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  modifier_id     TEXT NOT NULL,
  suggested_level TEXT,
  member_override TEXT,
  effective_level TEXT,
  weight          REAL NOT NULL DEFAULT 1,
  confidence      TEXT,
  rationale       TEXT,
  notes           TEXT,
  PRIMARY KEY (session_id, modifier_id)
);

CREATE INDEX IF NOT EXISTS idx_modres_level ON modifier_results (effective_level);
