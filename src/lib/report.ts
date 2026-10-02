// The export: one JSON record covering both halves of the review — how the risk
// was categorized, and which mitigation controls that categorization calls for.

import { DOMAINS } from '../data/riskData'
import { packageName } from '../data/evidencePackages'
import { MITIGATION_SOURCE } from '../data/mitigations'
import { computeDetermination, confirmedLevel } from './scoring'
import { summarizeMitigations } from './mitigations'
import type { Assessment } from './types'

export function buildReport(a: Assessment) {
  const det = computeDetermination(a.modifiers)
  const mit = summarizeMitigations(a.modifiers)

  return {
    reportType: 'CHAI AI Intake — risk categorization and mitigation controls',
    generatedAt: new Date().toISOString(),
    sources: {
      categorization: 'CHAI Risk Categorization Tool (v3)',
      mitigations: MITIGATION_SOURCE,
    },
    confidentiality:
      'Private to your organizational colleagues in the CHAI Member Portal and CHAI administrators.',
    review: {
      id: a.id,
      reviewerOrg: a.reviewerOrg,
      reviewer: a.reviewerName,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      categorizationAcceptedAt: a.categorizationAcceptedAt ?? null,
    },
    solution: {
      vendor: a.vendorName,
      name: a.solutionName,
      useCase: a.useCase,
    },
    documentationReceived: a.evidence.map((e) => ({
      package: packageName(e.packageId),
      packageId: e.packageId,
      evidenceExample: e.example ?? null,
      document: e.name,
      addedDuring: e.addedDuring,
    })),
    categorization: {
      overall: det.overall,
      highModifierCount: det.highCount,
      needsMoreInfoCount: det.needsInfoCount,
      confirmedByReviewer: det.confirmedCount,
      domains: det.domains.map((d) => ({
        domain: d.domainName,
        level: d.level,
        counts: d.counts,
      })),
      modifiers: DOMAINS.flatMap((domain) =>
        domain.modifiers.map((m) => {
          const st = a.modifiers[m.id]
          return {
            domain: domain.name,
            number: m.number,
            id: m.id,
            modifier: m.title,
            suggestedLevel: st?.suggested ?? null,
            confirmedLevel: st?.confirmed ?? null,
            level: st ? confirmedLevel(st) : null,
            confidence: st?.confidence ?? null,
            rationale: st?.rationale ?? null,
            documentationUsed: (st?.supportingEvidence ?? []).map(packageName),
            documentationMissing: (st?.missingEvidence ?? []).map(packageName),
            reviewerNotes: st?.notes ?? null,
          }
        }),
      ),
    },
    mitigationControls: {
      triggeredCount: mit.triggered.length,
      byUrgency: mit.byPeak,
      unresolvedModifiers: mit.unresolved.map((u) => `${u.number} ${u.title}`),
      controls: mit.triggered.map((t) => ({
        id: t.id,
        mitigation: t.name,
        appliesAtRiskLevels: t.appliesAt,
        description: t.description,
        urgency: t.peak,
        triggeredBy: t.reasons.map((r) => ({
          domain: r.domainName,
          modifier: `${r.modifierNumber} ${r.modifierTitle}`,
          confirmedLevel: r.level,
        })),
      })),
    },
  }
}

export function slug(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 44) || 'review'
  )
}

export function downloadJson(a: Assessment) {
  const blob = new Blob([JSON.stringify(buildReport(a), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const el = document.createElement('a')
  el.href = url
  el.download = `chai-ai-intake-${slug(a.solutionName || a.vendorName)}.json`
  document.body.appendChild(el)
  el.click()
  el.remove()
  URL.revokeObjectURL(url)
}
