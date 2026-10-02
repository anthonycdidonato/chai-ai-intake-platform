// Overall and per-domain risk.
//
// Faithful to the CHAI Risk Categorization Tool, which states that it does not
// produce a single risk score: each modifier is categorized independently, and
// the level that matters at the domain and solution level is the highest
// modifier present. If any modifier is High, the solution warrants a detailed
// risk assessment regardless of how many modifiers came out Low.
//
// N/A and Need More Info modifiers are carried in the counts but do not set a
// level — an unanswered modifier is a gap to close, not a low risk.

import { DOMAINS, type ResponseValue, type RiskLevel } from '../data/riskData'
import type { DomainResult, Determination, ModifierState } from './types'

export const LEVEL_VALUE: Record<RiskLevel, number> = { Low: 1, Medium: 2, High: 3 }

export const EMPTY_COUNTS: Record<ResponseValue, number> = {
  Low: 0,
  Medium: 0,
  High: 0,
  'N/A': 0,
  'Need More Info': 0,
}

/** The level in force for a modifier: the reviewer's confirmation, else the suggestion. */
export function confirmedLevel(state: ModifierState): ResponseValue {
  return state.confirmed ?? state.suggested
}

function isLevel(v: ResponseValue): v is RiskLevel {
  return v === 'Low' || v === 'Medium' || v === 'High'
}

function topOf(value: number): RiskLevel {
  if (value >= 3) return 'High'
  if (value >= 2) return 'Medium'
  return 'Low'
}

export function computeDetermination(
  modifiers: Record<string, ModifierState>,
): Determination {
  const domains: DomainResult[] = []
  let overallTop = 0
  let highCount = 0
  let needsInfoCount = 0
  let confirmedCount = 0

  for (const domain of DOMAINS) {
    const counts = { ...EMPTY_COUNTS }
    let top = 0

    for (const m of domain.modifiers) {
      const state = modifiers[m.id]
      if (!state) continue
      const level = confirmedLevel(state)
      counts[level] += 1
      if (state.confirmed) confirmedCount += 1
      if (level === 'Need More Info') needsInfoCount += 1
      if (isLevel(level)) top = Math.max(top, LEVEL_VALUE[level])
    }

    domains.push({
      domainId: domain.id,
      domainName: domain.name,
      level: top > 0 ? topOf(top) : 'Need More Info',
      counts,
    })
    overallTop = Math.max(overallTop, top)
    highCount += counts.High
  }

  return {
    overall: overallTop > 0 ? topOf(overallTop) : 'Need More Info',
    highCount,
    needsInfoCount,
    confirmedCount,
    domains,
  }
}
