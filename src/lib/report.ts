import { ALL_MODIFIERS } from '../data/riskData'
import { packageName } from '../data/evidencePackages'
import { MITIGATION_SOURCE } from '../data/mitigations'
import { summarize } from './scoring'
import { distinctMitigations, mitigationsByModifier } from './mitigations'
import type { Assessment } from './types'

export function buildReport(a: Assessment) {
  const s = summarize(a.modifiers)
  const groups = mitigationsByModifier(a.modifiers)
  return {
    reportType: 'CHAI AI Intake — risk levels and mitigations',
    generatedAt: new Date().toISOString(),
    sources: { riskModifiers: 'CHAI Risk Categorization Tool (v3)', mitigations: MITIGATION_SOURCE },
    solution: {
      name: a.solutionName,
      source: a.source === 'vendor' ? `Third-party vendor: ${a.vendorName}` : 'Internally developed',
      description: a.description,
    },
    review: { organization: a.orgName, reviewer: a.reviewerName, submittedAt: a.submittedAt ?? null },
    documents: a.documents.map((d) => ({
      file: d.name,
      documentType: d.packageId ? packageName(d.packageId) : 'Unassigned',
    })),
    overallRisk: s.overall ?? 'Not determined',
    domains: s.domains.map((d) => ({ domain: d.name, level: d.level ?? 'Not determined' })),
    riskModifiers: ALL_MODIFIERS.map((m) => {
      const st = a.modifiers[m.id]
      return {
        domain: m.domainName,
        number: m.number,
        modifier: m.title,
        evidence: st?.sufficient ? 'Sufficient' : 'Insufficient',
        suggested: st?.sufficient ? st.suggested : null,
        selected: st?.selected ?? null,
        rationale: st?.rationale ?? null,
        documentsToRequest: st && !st.sufficient ? st.missingEvidence.map(packageName) : [],
      }
    }),
    mitigations: {
      distinctCount: distinctMitigations(groups),
      byModifier: groups.map((g) => ({
        modifier: `${g.number} ${g.title}`,
        domain: g.domainName,
        selectedLevel: g.level,
        mitigations: g.mitigations.map((x) => ({ id: x.id, name: x.name, description: x.description })),
      })),
    },
  }
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 44) || 'assessment'

export function downloadJson(a: Assessment) {
  const blob = new Blob([JSON.stringify(buildReport(a), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const el = Object.assign(document.createElement('a'), { href: url, download: `chai-ai-intake-${slug(a.solutionName)}.json` })
  document.body.appendChild(el)
  el.click()
  el.remove()
  URL.revokeObjectURL(url)
}

export function emailBody(a: Assessment): string {
  const s = summarize(a.modifiers)
  const groups = mitigationsByModifier(a.modifiers)
  const L: string[] = [
    'CHAI AI Intake — risk levels and mitigations',
    '',
    `Solution: ${a.solutionName || '(unnamed)'}`,
    `Source: ${a.source === 'vendor' ? `Third-party vendor (${a.vendorName || 'unnamed'})` : 'Internally developed'}`,
    `Reviewed by: ${a.reviewerName || '—'}${a.orgName ? `, ${a.orgName}` : ''}`,
    '',
    `OVERALL RISK: ${s.overall ?? 'Not determined'}`,
    ...s.domains.map((d) => `  ${d.name}: ${d.level ?? 'Not determined'}`),
    '',
    'RISK MODIFIERS',
  ]
  for (const m of ALL_MODIFIERS) {
    const st = a.modifiers[m.id]
    L.push(`  ${m.number} ${m.title}: ${st?.selected ?? (st?.sufficient ? 'not selected' : 'insufficient evidence')}`)
  }
  L.push('', `MITIGATIONS (${distinctMitigations(groups)} distinct)`)
  for (const g of groups) {
    L.push(`  ${g.number} ${g.title} — ${g.level}`)
    for (const x of g.mitigations) L.push(`    • ${x.name}`)
  }
  L.push('', 'Full detail is in the attached JSON or PDF export from the CHAI AI Intake Platform.')
  return L.join('\n')
}

export function shareByEmail(a: Assessment, to: string) {
  const subject = `CHAI AI Intake — ${a.solutionName || 'AI solution'} risk review`
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody(a))}`
}
