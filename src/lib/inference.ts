// Rules-based categorization. Given the use case description and the evidence
// packages that have at least one document attached, suggest a level for every
// risk modifier — or flag it "Need More Info".

import { ALL_MODIFIERS, type ResponseValue, type RiskLevel } from '../data/riskData'
import { INFERENCE } from '../data/inferenceModel'
import { packageName } from '../data/evidencePackages'
import type { EvidenceFile, ModifierState } from './types'

const LEVEL_ORDER: RiskLevel[] = ['High', 'Medium', 'Low']

/** Evidence package ids that have at least one document attached. */
export function suppliedPackages(evidence: EvidenceFile[]): Set<string> {
  return new Set(evidence.map((f) => f.packageId))
}

function matchSignal(haystack: string, phrases: string[]): string | null {
  for (const phrase of phrases) {
    if (haystack.includes(phrase)) return phrase
  }
  return null
}

function quote(list: string[]): string {
  return list.map((id) => packageName(id)).join(', ')
}

export interface Suggestion {
  suggested: ResponseValue
  rationale: string
  supportingEvidence: string[]
  missingEvidence: string[]
  confidence: 'High' | 'Medium' | 'Low'
}

export function categorizeModifier(
  modifierId: string,
  useCase: string,
  supplied: Set<string>,
): Suggestion {
  const cfg = INFERENCE[modifierId]
  const text = ` ${useCase.toLowerCase().replace(/\s+/g, ' ')} `

  const supporting = cfg.informingEvidence.filter((id) => supplied.has(id))
  const missing = cfg.informingEvidence.filter((id) => !supplied.has(id))

  // 1. A phrase in the use case description is the strongest signal available.
  let signalLevel: RiskLevel | null = null
  let signalPhrase: string | null = null
  for (const level of LEVEL_ORDER) {
    const phrases = cfg.signals?.[level]
    if (!phrases) continue
    const hit = matchSignal(text, phrases)
    if (hit) {
      signalLevel = level
      signalPhrase = hit
      break
    }
  }

  // 2. Nothing in the description and nothing on file — cannot categorize.
  if (!signalLevel && supporting.length === 0) {
    return {
      suggested: 'Need More Info',
      rationale:
        `The use case description does not speak to this modifier, and none of the evidence ` +
        `that would answer it has been supplied. Add ${quote(cfg.informingEvidence)} ` +
        `to resolve this modifier.`,
      supportingEvidence: [],
      missingEvidence: missing,
      confidence: 'Low',
    }
  }

  if (signalLevel) {
    const backed = supporting.length > 0
    return {
      suggested: signalLevel,
      rationale:
        `Suggested ${signalLevel} because the use case description mentions ` +
        `"${signalPhrase}", which matches the ${signalLevel.toLowerCase()} risk definition. ` +
        (backed
          ? `Corroborated by evidence on file: ${quote(supporting)}.`
          : `No supporting evidence is on file yet — adding ${quote(cfg.informingEvidence)} ` +
            `would raise confidence in this suggestion.`),
      supportingEvidence: supporting,
      missingEvidence: missing,
      confidence: backed ? 'High' : 'Medium',
    }
  }

  // 3. Description is silent but evidence exists — place it on the evidence ladder.
  for (const rung of cfg.evidenceLadder ?? []) {
    if (rung.allOf.every((id) => supplied.has(id))) {
      return {
        suggested: rung.level,
        rationale:
          `The use case description does not address this modifier directly. Suggested ` +
          `${rung.level} based on the completeness of the evidence on file ` +
          `(${quote(rung.allOf)}).` +
          (missing.length
            ? ` Adding ${quote(missing)} — or describing this dimension explicitly in the ` +
              `use case — would sharpen the suggestion.`
            : ''),
        supportingEvidence: rung.allOf,
        missingEvidence: missing,
        confidence: 'Medium',
      }
    }
  }

  // 4. Some evidence, but not enough to place on the ladder.
  return {
    suggested: cfg.fallback,
    rationale:
      `Partial evidence on file (${quote(supporting)}), but not enough to categorize with ` +
      `confidence, and the use case description does not address this dimension. Defaulted to ` +
      `${cfg.fallback} — the precautionary level for this modifier. Add ${quote(missing)} to ` +
      `replace this default with an evidence-based suggestion.`,
    supportingEvidence: supporting,
    missingEvidence: missing,
    confidence: 'Low',
  }
}

/**
 * Categorize every modifier. Existing user overrides, weights, and notes are
 * carried forward so the user never loses work when evidence is added.
 */
export function categorizeAll(
  useCase: string,
  evidence: EvidenceFile[],
  previous?: Record<string, ModifierState>,
): Record<string, ModifierState> {
  const supplied = suppliedPackages(evidence)
  const out: Record<string, ModifierState> = {}
  for (const m of ALL_MODIFIERS) {
    const s = categorizeModifier(m.id, useCase, supplied)
    const prev = previous?.[m.id]
    out[m.id] = {
      ...s,
      override: prev?.override,
      weight: prev?.weight ?? 1,
      notes: prev?.notes,
    }
  }
  return out
}

/** The level actually in force for a modifier: the override if set, else the suggestion. */
export function effectiveLevel(state: ModifierState): ResponseValue {
  return state.override ?? state.suggested
}
