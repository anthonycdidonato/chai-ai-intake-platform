import { useCallback, useEffect, useRef, useState } from 'react'
import type { RiskLevel } from './data/riskData'
import { ALL_MODIFIERS } from './data/riskData'
import { categorizeAll } from './lib/inference'
import {
  lastSessionId,
  loadSession,
  rememberLastSession,
  saveSession,
} from './lib/store'
import type { EvidenceFile, IntakeSession, ModifierState } from './lib/types'
import { SiteFooter, SiteHeader, Stepper, type View } from './components/Chrome'
import { Landing } from './components/Landing'
import { IntakeForm } from './components/IntakeForm'
import { ResultsReview } from './components/ResultsReview'
import { ReportView } from './components/ReportView'
import { SessionsConsole } from './components/SessionsConsole'

function newSessionId() {
  return `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function blankSession(): IntakeSession {
  const now = new Date().toISOString()
  return {
    id: newSessionId(),
    orgName: '',
    orgType: 'hdo',
    submitterName: '',
    submitterEmail: '',
    solutionName: '',
    useCase: '',
    evidence: [],
    modifiers: {},
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [session, setSession] = useState<IntakeSession>(blankSession)
  const [resumable, setResumable] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimer = useRef<number | null>(null)

  const categorized = Object.keys(session.modifiers).length > 0

  // Is there a session from a previous visit worth offering to resume?
  useEffect(() => {
    const id = lastSessionId()
    if (!id) return
    void loadSession(id).then((s) => {
      if (s && (s.useCase || s.evidence.length)) setResumable(true)
    })
  }, [])

  // Persist the session, debounced, whenever anything meaningful changes.
  useEffect(() => {
    if (!session.useCase && session.evidence.length === 0 && !categorized) return
    setSaveState('saving')
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void saveSession(session).then(() => {
        rememberLastSession(session.id)
        setSaveState('saved')
      })
    }, 500)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const touch = useCallback((patch: Partial<IntakeSession>) => {
    setSession((prev) => ({ ...prev, ...patch, updatedAt: new Date().toISOString() }))
  }, [])

  /**
   * Re-run categorization. Called on "Generate", and again whenever evidence or
   * the use case changes after the first run so the review page stays live.
   */
  const recategorize = useCallback(
    (next: IntakeSession): IntakeSession => ({
      ...next,
      modifiers: categorizeAll(next.useCase, next.evidence, next.modifiers),
      status: next.status === 'accepted' ? 'accepted' : 'categorized',
      updatedAt: new Date().toISOString(),
    }),
    [],
  )

  const addEvidence = useCallback(
    (files: EvidenceFile[]) => {
      setSession((prev) => {
        const next = { ...prev, evidence: [...prev.evidence, ...files] }
        return Object.keys(prev.modifiers).length ? recategorize(next) : { ...next, updatedAt: new Date().toISOString() }
      })
    },
    [recategorize],
  )

  const removeEvidence = useCallback(
    (id: string) => {
      setSession((prev) => {
        const next = { ...prev, evidence: prev.evidence.filter((f) => f.id !== id) }
        return Object.keys(prev.modifiers).length ? recategorize(next) : { ...next, updatedAt: new Date().toISOString() }
      })
    },
    [recategorize],
  )

  const updateModifier = useCallback((id: string, patch: Partial<ModifierState>) => {
    setSession((prev) => ({
      ...prev,
      modifiers: { ...prev.modifiers, [id]: { ...prev.modifiers[id], ...patch } },
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const resetWeights = useCallback(() => {
    setSession((prev) => {
      const modifiers = { ...prev.modifiers }
      for (const id of Object.keys(modifiers)) modifiers[id] = { ...modifiers[id], weight: 1 }
      return { ...prev, modifiers, updatedAt: new Date().toISOString() }
    })
  }, [])

  function generate() {
    setSession((prev) => recategorize(prev))
    setView('review')
    window.scrollTo({ top: 0 })
  }

  function accept(level: RiskLevel, note: string, by: string) {
    touch({
      status: 'accepted',
      finalOverall: level,
      finalNote: note,
      acceptedBy: by,
      acceptedAt: new Date().toISOString(),
    })
  }

  function startNew() {
    setSession(blankSession())
    setView('intake')
    window.scrollTo({ top: 0 })
  }

  function resume() {
    const id = lastSessionId()
    if (!id) return
    void loadSession(id).then((s) => {
      if (!s) return
      setSession(s)
      setView(Object.keys(s.modifiers).length ? 'review' : 'intake')
      window.scrollTo({ top: 0 })
    })
  }

  function navigate(v: View) {
    if (v === 'review' && !categorized) return
    setView(v)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="shell">
      <SiteHeader view={view} onNavigate={navigate} hasSession={categorized} />
      <Stepper view={view} />

      <main className="main">
        <div className="wrap">
          {saveState !== 'idle' && view !== 'home' && (
            <p className="tiny muted no-print" style={{ textAlign: 'right', margin: '0 0 8px' }}>
              {saveState === 'saving' ? 'Saving…' : 'Saved to session record'} · session{' '}
              <code>{session.id.slice(0, 12)}</code>
            </p>
          )}

          {view === 'home' && (
            <Landing onStart={startNew} onResume={resume} resumable={resumable} />
          )}

          {view === 'intake' && (
            <IntakeForm
              session={session}
              onChange={touch}
              onAddEvidence={addEvidence}
              onRemoveEvidence={removeEvidence}
              onGenerate={generate}
            />
          )}

          {view === 'review' &&
            (categorized ? (
              <ResultsReview
                session={session}
                onModifier={updateModifier}
                onAddEvidence={addEvidence}
                onRemoveEvidence={removeEvidence}
                onResetWeights={resetWeights}
                onContinue={() => {
                  setView('report')
                  window.scrollTo({ top: 0 })
                }}
                onBack={() => {
                  setView('intake')
                  window.scrollTo({ top: 0 })
                }}
              />
            ) : (
              <div className="alert info">
                <span aria-hidden="true">ℹ️</span>
                <span>
                  No categorization yet.{' '}
                  <button className="btn ghost sm" onClick={() => setView('intake')}>
                    Start with the intake form
                  </button>
                </span>
              </div>
            ))}

          {view === 'report' && (
            <ReportView
              session={session}
              onAccept={accept}
              onBack={() => {
                setView('review')
                window.scrollTo({ top: 0 })
              }}
              onNewSession={startNew}
            />
          )}

          {view === 'admin' && (
            <SessionsConsole
              currentId={session.id}
              onOpen={(s) => {
                setSession(s)
                setView(Object.keys(s.modifiers).length ? 'report' : 'intake')
                window.scrollTo({ top: 0 })
              }}
            />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

// Referenced so the modifier list stays in sync with the inference model at build time.
void ALL_MODIFIERS
