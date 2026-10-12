// Step 2 engine. A modifier gets a suggested level only when the documentation
// uploaded in step 1 includes at least one document type that answers it.
// The description refines the level; it never substitutes for evidence.

import { ALL_MODIFIERS, type RiskLevel } from '../data/riskData'
import { INFERENCE } from '../data/inferenceModel'
import { packageName } from '../data/evidencePackages'
import type { ModifierState, UploadedDoc } from './types'

const LEVEL_ORDER: RiskLevel[] = ['High', 'Medium', 'Low']

export function suppliedPackages(documents: UploadedDoc[]): Set<string> {
  return new Set(documents.flatMap((d) => (d.packageId ? [d.packageId] : [])))
}

const names = (ids: string[]) => ids.map(packageName).join(', ')

export function categorizeModifier(
  modifierId: string,
  description: string,
  supplied: Set<string>,
): Omit<ModifierState, 'selected'> {
  const cfg = INFERENCE[modifierId]
  const supporting = cfg.informingEvidence.filter((id) => supplied.has(id))
  const missing = cfg.informingEvidence.filter((id) => !supplied.has(id))

  if (supporting.length === 0) {
    return {
      sufficient: false,
      suggested: 'Need More Info',
      rationale: `No document on file answers this modifier. Request: ${names(cfg.informingEvidence)}.`,
      supportingEvidence: [],
      missingEvidence: missing,
    }
  }

  const text = ` ${description.toLowerCase().replace(/\s+/g, ' ')} `
  for (const level of LEVEL_ORDER) {
    const hit = cfg.signals?.[level]?.find((p) => text.includes(p))
    if (hit) {
      return {
        sufficient: true,
        suggested: level,
        rationale: `Your description mentions "${hit}", which matches the ${level} definition; supported by ${names(supporting)}.`,
        supportingEvidence: supporting,
        missingEvidence: missing,
      }
    }
  }

  const rung = (cfg.evidenceLadder ?? []).find((r) => r.allOf.every((id) => supplied.has(id)))
  if (rung) {
    return {
      sufficient: true,
      suggested: rung.level,
      rationale: `Based on ${names(rung.allOf)}.`,
      supportingEvidence: rung.allOf,
      missingEvidence: missing,
    }
  }

  return {
    sufficient: true,
    suggested: cfg.fallback,
    rationale: `${names(supporting)} on file, but not enough to be specific — ${cfg.fallback} is the precautionary default. Adding ${names(missing)} would sharpen this.`,
    supportingEvidence: supporting,
    missingEvidence: missing,
  }
}

/** Recategorize every modifier, keeping any selection the reviewer already made. */
export function categorizeAll(
  description: string,
  documents: UploadedDoc[],
  previous?: Record<string, ModifierState>,
): Record<string, ModifierState> {
  const supplied = suppliedPackages(documents)
  const out: Record<string, ModifierState> = {}
  for (const m of ALL_MODIFIERS) {
    const next = categorizeModifier(m.id, description, supplied)
    const prev = previous?.[m.id]
    const suggestedLevel = next.sufficient ? (next.suggested as RiskLevel) : undefined
    out[m.id] = { ...next, selected: prev?.selected ?? suggestedLevel }
  }
  return out
}
