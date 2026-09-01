// Turns per-modifier levels plus member-set weights into domain and overall
// risk. Two figures are always reported side by side:
//
//   CHAI level      — faithful to the Risk Categorization Tool: the tool does
//                     not produce a single score, and any High modifier means
//                     the solution warrants a detailed risk assessment. So the
//                     CHAI level is simply the highest response present.
//   Weighted level  — the member-adjusted composite. Each modifier contributes
//                     in proportion to the weight the member assigned it.
//
// N/A and Need More Info modifiers are excluded from the weighted math.

import { DOMAINS, type ResponseValue, type RiskLevel } from '../data/riskData'
import { effectiveLevel } from './inference'
import type { Determination, DomainResult, ModifierState } from './types'

export const LEVEL_VALUE: Record<RiskLevel, number> = { Low: 1, Medium: 2, High: 3 }

/** Band a weighted mean (1–3) into Low / Medium / High. */
export function bandScore(score: number): RiskLevel {
  if (score < 1.6667) return 'Low'
  if (score < 2.3334) return 'Medium'
  return 'High'
}

export const EMPTY_COUNTS: Record<ResponseValue, number> = {
  Low: 0,
  Medium: 0,
  High: 0,
  'N/A': 0,
  'Need More Info': 0,
}

function isScorable(level: ResponseValue): level is RiskLevel {
  return level === 'Low' || level === 'Medium' || level === 'High'
}

interface Weighted {
  weightSum: number
  valueSum: number
}

function accumulate(ids: string[], modifiers: Record<string, ModifierState>) {
  const counts = { ...EMPTY_COUNTS }
  const w: Weighted = { weightSum: 0, valueSum: 0 }
  let highest = 0
  let needsInfo = 0

  for (const id of ids) {
    const state = modifiers[id]
    if (!state) continue
    const level = effectiveLevel(state)
    counts[level] += 1
    if (level === 'Need More Info') needsInfo += 1
    if (!isScorable(level)) continue
    highest = Math.max(highest, LEVEL_VALUE[level])
    if (state.weight > 0) {
      w.weightSum += state.weight
      w.valueSum += state.weight * LEVEL_VALUE[level]
    }
  }
  return { counts, w, highest, needsInfo }
}

/** Share of the weighted total that one modifier accounts for, as a percentage. */
export function contribution(
  modifierId: string,
  modifiers: Record<string, ModifierState>,
  scope: string[],
): number {
  const state = modifiers[modifierId]
  if (!state) return 0
  const level = effectiveLevel(state)
  if (!isScorable(level) || state.weight <= 0) return 0
  let total = 0
  for (const id of scope) {
    const s = modifiers[id]
    if (!s) continue
    const l = effectiveLevel(s)
    if (isScorable(l) && s.weight > 0) total += s.weight * LEVEL_VALUE[l]
  }
  if (total === 0) return 0
  return ((state.weight * LEVEL_VALUE[level]) / total) * 100
}

export function computeDetermination(
  modifiers: Record<string, ModifierState>,
): Determination {
  const domainResults: DomainResult[] = []
  let allWeightSum = 0
  let allValueSum = 0
  let allHighest = 0
  let highCount = 0
  let needsInfoCount = 0

  for (const domain of DOMAINS) {
    const ids = domain.modifiers.map((m) => m.id)
    const { counts, w, highest, needsInfo } = accumulate(ids, modifiers)
    const score = w.weightSum > 0 ? w.valueSum / w.weightSum : 0
    domainResults.push({
      domainId: domain.id,
      domainName: domain.name,
      chaiLevel: highest > 0 ? bandTop(highest) : 'Need More Info',
      weightedLevel: w.weightSum > 0 ? bandScore(score) : 'Low',
      weightedScore: score,
      counts,
    })
    allWeightSum += w.weightSum
    allValueSum += w.valueSum
    allHighest = Math.max(allHighest, highest)
    highCount += counts.High
    needsInfoCount += needsInfo
  }

  const weightedScore = allWeightSum > 0 ? allValueSum / allWeightSum : 0
  const weightedOverall = allWeightSum > 0 ? bandScore(weightedScore) : 'Low'
  const chaiOverall: RiskLevel | 'Need More Info' =
    allHighest > 0 ? bandTop(allHighest) : 'Need More Info'

  // Recommend the more conservative of the two so a High modifier is never
  // averaged away by weighting.
  const suggestedOverall: RiskLevel | 'Need More Info' =
    chaiOverall === 'Need More Info'
      ? 'Need More Info'
      : LEVEL_VALUE[chaiOverall] >= LEVEL_VALUE[weightedOverall]
        ? chaiOverall
        : weightedOverall

  return {
    chaiOverall,
    weightedOverall,
    weightedScore,
    suggestedOverall,
    highCount,
    needsInfoCount,
    domains: domainResults,
  }
}

function bandTop(value: number): RiskLevel {
  if (value >= 3) return 'High'
  if (value >= 2) return 'Medium'
  return 'Low'
}
