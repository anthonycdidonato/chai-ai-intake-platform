// Overall risk = the highest level the reviewer selected. The CHAI tool does not
// average modifiers: one High is enough to warrant a detailed risk assessment.

import { DOMAINS, type RiskLevel } from '../data/riskData'
import type { ModifierState } from './types'

const RANK: Record<RiskLevel, number> = { Low: 1, Medium: 2, High: 3 }
const NAME: RiskLevel[] = ['Low', 'Medium', 'High']

export function highestOf(ids: string[], modifiers: Record<string, ModifierState>): RiskLevel | null {
  let top = 0
  for (const id of ids) {
    const s = modifiers[id]?.selected
    if (s && s !== 'N/A') top = Math.max(top, RANK[s])
  }
  return top ? NAME[top - 1] : null
}

export interface Summary {
  overall: RiskLevel | null
  domains: { id: string; name: string; level: RiskLevel | null }[]
  selected: number
  insufficient: number
  unselected: number
}

export function summarize(modifiers: Record<string, ModifierState>): Summary {
  const all = Object.values(modifiers)
  return {
    overall: highestOf(Object.keys(modifiers), modifiers),
    domains: DOMAINS.map((d) => ({
      id: d.id,
      name: d.name,
      level: highestOf(d.modifiers.map((m) => m.id), modifiers),
    })),
    selected: all.filter((m) => m.selected).length,
    insufficient: all.filter((m) => !m.sufficient).length,
    unselected: all.filter((m) => !m.selected).length,
  }
}
