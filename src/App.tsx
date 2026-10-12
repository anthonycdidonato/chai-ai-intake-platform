import { useCallback, useEffect, useState } from 'react'
import { SiteFooter, SiteHeader, Stepper } from './components/Chrome'
import { Intake, guessType } from './components/Intake'
import { Levels } from './components/Levels'
import { Mitigations } from './components/Mitigations'
import { categorizeAll } from './lib/inference'
import { clear, load, save } from './lib/store'
import type { Assessment, Step } from './lib/types'
import type { RiskLevel } from './data/riskData'

const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
const now = () => new Date().toISOString()

function blank(): Assessment {
  return { id: uid(), solutionName: '', source: 'vendor', vendorName: '', orgName: '', reviewerName: '', description: '', documents: [], modifiers: {}, step: 'intake', createdAt: now(), updatedAt: now() }
}

export default function App() {
  const [a, setA] = useState<Assessment>(() => load() ?? blank())
  const [saved, setSaved] = useState(false)
  useEffect(() => { save(a); setSaved(false) }, [a])

  const patch = useCallback((fn: (p: Assessment) => Assessment) => setA((p) => ({ ...fn(p), updatedAt: now() })), [])
  const recat = (p: Assessment): Assessment => Object.keys(p.modifiers).length ? { ...p, modifiers: categorizeAll(p.description, p.documents, p.modifiers) } : p

  const go = (step: Step) => { patch((p) => ({ ...p, step })); window.scrollTo({ top: 0 }) }
  const reachable: Step[] = ['intake', ...(Object.keys(a.modifiers).length ? ['levels' as Step] : []), ...(a.submittedAt ? ['mitigations' as Step] : [])]

  return (
    <div className="shell">
      <SiteHeader started={Boolean(a.solutionName || a.description || a.documents.length)} saved={saved}
        onSave={() => { save(a); setSaved(true) }} onRestart={() => { clear(); setA(blank()); window.scrollTo({ top: 0 }) }} />
      <Stepper step={a.step} reachable={reachable} onGo={go} />
      <main className="main"><div className="wrap">
        {a.step === 'intake' && (
          <Intake a={a} onChange={(c) => patch((p) => ({ ...p, ...c }))}
            onAddFiles={(files) => patch((p) => recat({ ...p, documents: [...p.documents, ...Array.from(files).map((f) => ({ id: uid(), name: f.name, size: f.size, packageId: guessType(f.name) }))] }))}
            onSetType={(id, packageId) => patch((p) => recat({ ...p, documents: p.documents.map((d) => (d.id === id ? { ...d, packageId } : d)) }))}
            onRemove={(id) => patch((p) => recat({ ...p, documents: p.documents.filter((d) => d.id !== id) }))}
            onNext={() => { patch((p) => ({ ...p, modifiers: categorizeAll(p.description, p.documents, p.modifiers), step: 'levels' })); window.scrollTo({ top: 0 }) }} />
        )}
        {a.step === 'levels' && (
          <Levels a={a} onBack={() => go('intake')}
            onSelect={(id, level: RiskLevel | 'N/A' | undefined) => patch((p) => ({ ...p, modifiers: { ...p.modifiers, [id]: { ...p.modifiers[id], selected: level } } }))}
            onSubmit={() => { patch((p) => ({ ...p, submittedAt: now(), step: 'mitigations' })); window.scrollTo({ top: 0 }) }} />
        )}
        {a.step === 'mitigations' && <Mitigations a={a} onBack={() => go('levels')} />}
      </div></main>
      <SiteFooter />
    </div>
  )
}
