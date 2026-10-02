// Rules-based categorization. Given the use case description and the vendor
// documentation on file, suggest a level for every risk modifier — or say
// plainly that the documentation received cannot answer it.

import { ALL_MODIFIERS, type ResponseValue, type RiskLevel } from '../data/riskData'
import { INFERENCE } from '../data/inferenceModel'
import { packageName } from '../data/evidencePackages'
import type { EvidenceItem, ModifierState } from './types'

const LEVEL_ORDER: RiskLevel[] = ['High', 'Medium', 'Low']

/** Evidence package ids with at least one document on file. */
export function suppliedPackages(evidence: EvidenceItem[]): Set<string> {
  return new Set(evidence.map((f) => f.packageId))
}

function matchSignal(haystack: string, phrases: string[]): string | null {
  for (const phrase of phrases) if (haystack.includes(phrase)) return phrase
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

  if (!signalLevel && supporting.length === 0) {
    return {
      suggested: 'Need More Info',
      rationale:
        `Your description does not speak to this modifier, and none of the vendor ` +
        `documentation that would answer it is on file. Request ${quote(cfg.informingEvidence)} ` +
        `from the vendor, or describe this dimension in the use case.`,
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
        `Suggested ${signalLevel} because the use case mentions "${signalPhrase}", which matches ` +
        `the ${signalLevel.toLowerCase()} risk definition. ` +
        (backed
          ? `Corroborated by documentation on file: ${quote(supporting)}.`
          : `No supporting documentation on file yet — ${quote(cfg.informingEvidence)} would ` +
            `raise confidence in this suggestion.`),
      supportingEvidence: supporting,
      missingEvidence: missing,
      confidence: backed ? 'High' : 'Medium',
    }
  }

  for (const rung of cfg.evidenceLadder ?? []) {
    if (rung.allOf.every((id) => supplied.has(id))) {
      return {
        suggested: rung.level,
        rationale:
          `Your description does not address this modifier directly. Suggested ${rung.level} ` +
          `based on the documentation on file (${quote(rung.allOf)}).` +
          (missing.length
            ? ` Adding ${quote(missing)} — or describing this dimension explicitly — would ` +
              `sharpen the suggestion.`
            : ''),
        supportingEvidence: rung.allOf,
        missingEvidence: missing,
        confidence: 'Medium',
      }
    }
  }

  return {
    suggested: cfg.fallback,
    rationale:
      `Partial documentation on file (${quote(supporting)}), but not enough to categorize with ` +
      `confidence, and the use case does not address this dimension. Defaulted to ${cfg.fallback} — ` +
      `the precautionary level for this modifier. Request ${quote(missing)} to replace this ` +
      `default with an evidence-based suggestion.`,
    supportingEvidence: supporting,
    missingEvidence: missing,
    confidence: 'Low',
  }
}

/**
 * Categorize every modifier. The reviewer's confirmations and notes are carried
 * forward, so adding a document never discards work already done.
 */
export function categorizeAll(
  useCase: string,
  evidence: EvidenceItem[],
  previous?: Record<string, ModifierState>,
): Record<string, ModifierState> {
  const supplied = suppliedPackages(evidence)
  const out: Record<string, ModifierState> = {}
  for (const m of ALL_MODIFIERS) {
    const prev = previous?.[m.id]
    out[m.id] = {
      ...categorizeModifier(m.id, useCase, supplied),
      confirmed: prev?.confirmed,
      notes: prev?.notes,
    }
  }
  return out
}
