import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteFooter, SiteHeader, Stepper } from './components/Chrome'
import { Describe } from './components/Describe'
import { Categorize } from './components/Categorize'
import { Mitigate } from './components/Mitigate'
import { Report } from './components/Report'
import { categorizeAll } from './lib/inference'
import { clear, load, save } from './lib/store'
import type { Assessment, EvidenceItem, Step } from './lib/types'
import type { ResponseValue } from './data/riskData'

function uid() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  )
}

function blank(): Assessment {
  const now = new Date().toISOString()
  return {
    id: uid(),
    reviewerOrg: '',
    reviewerName: '',
    vendorName: '',
    solutionName: '',
    useCase: '',
    evidence: [],
    modifiers: {},
    step: 'describe',
    createdAt: now,
    updatedAt: now,
  }
}

export default function App() {
  const [a, setA] = useState<Assessment>(() => load() ?? blank())

  useEffect(() => {
    save(a)
  }, [a])

  const update = useCallback((patch: Partial<Assessment>) => {
    setA((prev) => ({ ...prev, ...patch, updatedAt: new Date().toISOString() }))
  }, [])

  /** Re-run categorization whenever the inputs it depends on change. */
  const recategorize = useCallback((next: Assessment): Assessment => {
    if (Object.keys(next.modifiers).length === 0 && next.step === 'describe') return next
    return { ...next, modifiers: categorizeAll(next.useCase, next.evidence, next.modifiers) }
  }, [])

  const addEvidence = useCallback(
    (packageId: string, name: string, example?: string) => {
      setA((prev) => {
        const item: EvidenceItem = {
          id: uid(),
          packageId,
          name,
          example,
          addedDuring: prev.step === 'describe' ? 'intake' : 'review',
        }
        const next = { ...prev, evidence: [...prev.evidence, item], updatedAt: new Date().toISOString() }
        return recategorize(next)
      })
    },
    [recategorize],
  )

  const removeEvidence = useCallback(
    (id: string) => {
      setA((prev) => {
        const next = {
          ...prev,
          evidence: prev.evidence.filter((e) => e.id !== id),
          updatedAt: new Date().toISOString(),
        }
        return recategorize(next)
      })
    },
    [recategorize],
  )

  const generate = useCallback(() => {
    setA((prev) => ({
      ...prev,
      modifiers: categorizeAll(prev.useCase, prev.evidence, prev.modifiers),
      step: 'categorize',
      updatedAt: new Date().toISOString(),
    }))
    window.scrollTo({ top: 0 })
  }, [])

  const setLevel = useCallback((modifierId: string, level: ResponseValue | undefined) => {
    setA((prev) => {
      const st = prev.modifiers[modifierId]
      if (!st) return prev
      return {
        ...prev,
        modifiers: { ...prev.modifiers, [modifierId]: { ...st, confirmed: level } },
        updatedAt: new Date().toISOString(),
      }
    })
  }, [])

  const setNotes = useCallback((modifierId: string, notes: string) => {
    setA((prev) => {
      const st = prev.modifiers[modifierId]
      if (!st) return prev
      return {
        ...prev,
        modifiers: { ...prev.modifiers, [modifierId]: { ...st, notes } },
        updatedAt: new Date().toISOString(),
      }
    })
  }, [])

  const confirmAll = useCallback(() => {
    setA((prev) => {
      const modifiers = Object.fromEntries(
        Object.entries(prev.modifiers).map(([id, st]) => [
          id,
          { ...st, confirmed: st.confirmed ?? st.suggested },
        ]),
      )
      return { ...prev, modifiers, updatedAt: new Date().toISOString() }
    })
  }, [])

  const go = useCallback((step: Step) => {
    setA((prev) => ({
      ...prev,
      step,
      ...(step === 'mitigate' && !prev.categorizationAcceptedAt
        ? { categorizationAcceptedAt: new Date().toISOString() }
        : {}),
      updatedAt: new Date().toISOString(),
    }))
    window.scrollTo({ top: 0 })
  }, [])

  const restart = useCallback(() => {
    clear()
    setA(blank())
    window.scrollTo({ top: 0 })
  }, [])

  const reachable = useMemo<Step[]>(() => {
    const hasModifiers = Object.keys(a.modifiers).length > 0
    const steps: Step[] = ['describe']
    if (hasModifiers) steps.push('categorize')
    if (a.categorizationAcceptedAt) steps.push('mitigate', 'report')
    return steps
  }, [a.modifiers, a.categorizationAcceptedAt])

  const started = a.useCase.trim().length > 0 || a.evidence.length > 0

  return (
    <div className="shell">
      <SiteHeader onRestart={restart} started={started} />
      <Stepper step={a.step} reachable={reachable} onGo={go} />
      <main className="main">
        <div className="wrap">
          {a.step === 'describe' && (
            <Describe
              a={a}
              onChange={update}
              onAddEvidence={addEvidence}
              onRemoveEvidence={removeEvidence}
              onGenerate={generate}
            />
          )}
          {a.step === 'categorize' && (
            <Categorize
              a={a}
              onSetLevel={setLevel}
              onSetNotes={setNotes}
              onAddEvidence={addEvidence}
              onRemoveEvidence={removeEvidence}
              onConfirmAll={confirmAll}
              onAccept={() => go('mitigate')}
              onBack={() => go('describe')}
            />
          )}
          {a.step === 'mitigate' && (
            <Mitigate a={a} onBack={() => go('categorize')} onNext={() => go('report')} />
          )}
          {a.step === 'report' && <Report a={a} onBack={() => go('mitigate')} />}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
