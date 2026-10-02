// Which mitigation controls does a confirmed risk profile call for?
//
// The rule is deliberately simple and fully traceable: a control is triggered
// when any risk modifier it maps to has been confirmed at a level the control
// applies at. Every triggered control can therefore name the modifier and the
// level that pulled it in, which is what makes the output reviewable rather
// than a list to take on faith.

import { ALL_MODIFIERS, type ResponseValue, type RiskLevel } from '../data/riskData'
import { MITIGATIONS, type Mitigation } from '../data/mitigations'
import type { ModifierState } from './types'
import { confirmedLevel } from './scoring'

export interface TriggerReason {
  modifierId: string
  modifierNumber: string
  modifierTitle: string
  domainName: string
  level: RiskLevel
}

export interface TriggeredMitigation extends Mitigation {
  /** Every modifier/level pair that pulled this control in, highest first. */
  reasons: TriggerReason[]
  /** The highest level among the reasons — how urgent this control is. */
  peak: RiskLevel
}

const RANK: Record<RiskLevel, number> = { Low: 1, Medium: 2, High: 3 }

const MODIFIER_META = Object.fromEntries(
  ALL_MODIFIERS.map((m) => [m.id, m]),
) as Record<string, (typeof ALL_MODIFIERS)[number]>

function isLevel(v: ResponseValue): v is RiskLevel {
  return v === 'Low' || v === 'Medium' || v === 'High'
}

/**
 * Triggered controls, ordered by urgency (High-triggered first), then by how
 * many modifiers call for them, then by library id so the order is stable.
 */
export function triggeredMitigations(
  modifiers: Record<string, ModifierState>,
): TriggeredMitigation[] {
  const out: TriggeredMitigation[] = []

  for (const m of MITIGATIONS) {
    const reasons: TriggerReason[] = []

    for (const modifierId of m.modifiers) {
      const state = modifiers[modifierId]
      const meta = MODIFIER_META[modifierId]
      if (!state || !meta) continue
      const level = confirmedLevel(state)
      if (!isLevel(level)) continue
      if (!m.appliesAt.includes(level)) continue
      reasons.push({
        modifierId,
        modifierNumber: meta.number,
        modifierTitle: meta.title,
        domainName: meta.domainName,
        level,
      })
    }

    if (reasons.length === 0) continue
    reasons.sort((a, b) => RANK[b.level] - RANK[a.level] || a.modifierId.localeCompare(b.modifierId))
    out.push({ ...m, reasons, peak: reasons[0].level })
  }

  out.sort(
    (a, b) =>
      RANK[b.peak] - RANK[a.peak] ||
      b.reasons.length - a.reasons.length ||
      a.id.localeCompare(b.id),
  )
  return out
}

/** Controls that are not triggered, with the reason they are not. */
export function dormantCount(modifiers: Record<string, ModifierState>): number {
  return MITIGATIONS.length - triggeredMitigations(modifiers).length
}

export interface MitigationSummary {
  triggered: TriggeredMitigation[]
  byPeak: Record<RiskLevel, number>
  /** Modifiers still unresolved — controls behind them cannot be determined. */
  unresolved: { id: string; number: string; title: string; domainName: string }[]
}

export function summarizeMitigations(
  modifiers: Record<string, ModifierState>,
): MitigationSummary {
  const triggered = triggeredMitigations(modifiers)
  const byPeak: Record<RiskLevel, number> = { Low: 0, Medium: 0, High: 0 }
  for (const t of triggered) byPeak[t.peak] += 1

  const unresolved = ALL_MODIFIERS.filter((m) => {
    const st = modifiers[m.id]
    return st && confirmedLevel(st) === 'Need More Info'
  }).map((m) => ({ id: m.id, number: m.number, title: m.title, domainName: m.domainName }))

  return { triggered, byPeak, unresolved }
}
