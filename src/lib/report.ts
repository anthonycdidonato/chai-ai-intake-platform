// Report generation: the JSON export, the mailto share, and the printable PDF.

import { ALL_MODIFIERS, DOMAINS } from '../data/riskData'
import { packageName } from '../data/evidencePackages'
import { effectiveLevel } from './inference'
import { computeDetermination, contribution } from './scoring'
import type { IntakeSession } from './types'

export function buildReport(session: IntakeSession) {
  const det = computeDetermination(session.modifiers)
  const allIds = ALL_MODIFIERS.map((m) => m.id)

  return {
    reportType: 'CHAI AI Intake — Risk Categorization',
    generatedAt: new Date().toISOString(),
    source: 'CHAI Risk Categorization Tool (v3)',
    confidentiality:
      'Private to the submitting organization’s colleagues in the CHAI Member Portal and CHAI administrators.',
    session: {
      id: session.id,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      acceptedAt: session.acceptedAt ?? null,
      acceptedBy: session.acceptedBy ?? null,
    },
    organization: {
      name: session.orgName,
      type: session.orgType === 'vendor' ? 'Technology vendor' : 'Healthcare delivery organization',
      submitter: session.submitterName,
      submitterEmail: session.submitterEmail,
    },
    solution: { name: session.solutionName, useCase: session.useCase },
    evidence: session.evidence.map((f) => ({
      package: packageName(f.packageId),
      packageId: f.packageId,
      evidenceExample: f.example ?? null,
      fileName: f.name,
      fileType: f.type,
      fileSizeBytes: f.size,
      uploadedAt: f.uploadedAt,
      addedDuring: f.addedDuring,
    })),
    determination: {
      chaiOverall: det.chaiOverall,
      weightedOverall: det.weightedOverall,
      weightedScore: Number(det.weightedScore.toFixed(3)),
      platformSuggestedOverall: det.suggestedOverall,
      finalAcceptedOverall: session.finalOverall ?? null,
      finalNote: session.finalNote ?? null,
      highModifierCount: det.highCount,
      needsMoreInfoCount: det.needsInfoCount,
      domains: det.domains.map((d) => ({
        domain: d.domainName,
        chaiLevel: d.chaiLevel,
        weightedLevel: d.weightedLevel,
        weightedScore: Number(d.weightedScore.toFixed(3)),
        counts: d.counts,
      })),
    },
    riskModifiers: DOMAINS.flatMap((domain) =>
      domain.modifiers.map((m) => {
        const st = session.modifiers[m.id]
        return {
          domain: domain.name,
          number: m.number,
          id: m.id,
          modifier: m.title,
          suggestedLevel: st?.suggested ?? null,
          memberOverride: st?.override ?? null,
          effectiveLevel: st ? effectiveLevel(st) : null,
          weight: st?.weight ?? null,
          contributionPercent: st
            ? Number(contribution(m.id, session.modifiers, allIds).toFixed(1))
            : null,
          confidence: st?.confidence ?? null,
          rationale: st?.rationale ?? null,
          supportingEvidence: (st?.supportingEvidence ?? []).map(packageName),
          missingEvidence: (st?.missingEvidence ?? []).map(packageName),
          memberNotes: st?.notes ?? null,
        }
      }),
    ),
    nextPhase:
      'Risk mitigation controls — operational and contractual controls at the use case level, and ' +
      'governance controls at the organizational level — triggered by the risk levels above. Coming soon.',
  }
}

export function downloadJson(session: IntakeSession) {
  const blob = new Blob([JSON.stringify(buildReport(session), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chai-ai-intake-${slug(session.solutionName || session.orgName)}-${session.id.slice(0, 8)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function slug(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'session'
  )
}

/** Plain-text summary used for the email share. */
export function emailBody(session: IntakeSession): string {
  const det = computeDetermination(session.modifiers)
  const lines: string[] = []
  lines.push(`CHAI AI Intake Platform — Risk Categorization`)
  lines.push(``)
  lines.push(`Solution: ${session.solutionName || '(unnamed)'}`)
  lines.push(`Organization: ${session.orgName} (${session.orgType === 'vendor' ? 'Technology vendor' : 'Healthcare delivery organization'})`)
  lines.push(`Session: ${session.id}`)
  lines.push(`Status: ${session.status}`)
  lines.push(``)
  lines.push(`OVERALL`)
  lines.push(`  CHAI level (highest modifier): ${det.chaiOverall}`)
  lines.push(`  Weighted composite: ${det.weightedOverall} (${det.weightedScore.toFixed(2)} of 3.00)`)
  if (session.finalOverall) lines.push(`  Final accepted determination: ${session.finalOverall}`)
  lines.push(`  High modifiers: ${det.highCount}   Needs more information: ${det.needsInfoCount}`)
  lines.push(``)
  for (const d of det.domains) {
    lines.push(`${d.domainName.toUpperCase()}`)
    lines.push(`  CHAI level: ${d.chaiLevel} | Weighted: ${d.weightedLevel} (${d.weightedScore.toFixed(2)})`)
    const domain = DOMAINS.find((x) => x.id === d.domainId)!
    for (const m of domain.modifiers) {
      const st = session.modifiers[m.id]
      if (!st) continue
      lines.push(
        `  ${m.number} ${m.title}: ${effectiveLevel(st)}` +
          (st.override ? ` (member override of ${st.suggested})` : '') +
          `  [weight ${st.weight.toFixed(1)}]`,
      )
    }
    lines.push(``)
  }
  lines.push(`Evidence on file (${session.evidence.length} document${session.evidence.length === 1 ? '' : 's'}):`)
  for (const f of session.evidence) lines.push(`  - ${packageName(f.packageId)}: ${f.name}`)
  lines.push(``)
  lines.push(
    `Confidential: private to ${session.orgName} colleagues in the CHAI Member Portal and CHAI administrators.`,
  )
  return lines.join('\n')
}

export function shareByEmail(session: IntakeSession, recipients: string) {
  const subject = `CHAI AI Intake — risk categorization for ${session.solutionName || session.orgName}`
  const href =
    `mailto:${encodeURIComponent(recipients)}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(emailBody(session))}`
  window.location.href = href
}
