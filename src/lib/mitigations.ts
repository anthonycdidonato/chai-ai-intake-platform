// Step 3: for each modifier and the level the reviewer selected, the mitigations
// the CHAI library maps to it at that level. Name and description only.

import { ALL_MODIFIERS, type RiskLevel } from '../data/riskData'
import { MITIGATIONS, type Mitigation } from '../data/mitigations'
import type { ModifierState } from './types'

export interface ModifierMitigations {
  modifierId: string
  number: string
  title: string
  domainName: string
  level: RiskLevel
  mitigations: Mitigation[]
}

export function mitigationsByModifier(
  modifiers: Record<string, ModifierState>,
): ModifierMitigations[] {
  const out: ModifierMitigations[] = []
  for (const m of ALL_MODIFIERS) {
    const level = modifiers[m.id]?.selected
    if (!level || level === 'N/A') continue
    out.push({
      modifierId: m.id,
      number: m.number,
      title: m.title,
      domainName: m.domainName,
      level,
      mitigations: MITIGATIONS.filter(
        (x) => x.modifiers.includes(m.id) && x.appliesAt.includes(level),
      ),
    })
  }
  return out
}

/** Distinct mitigations across all modifiers — the number to implement. */
export function distinctMitigations(groups: ModifierMitigations[]): number {
  return new Set(groups.flatMap((g) => g.mitigations.map((x) => x.id))).size
}
