// The documentation checklist. The reviewer records which documents they have
// received from the vendor; the file itself never leaves their machine, because
// the categorization only ever depends on which packages are in hand.

import { useState } from 'react'
import {
  EVIDENCE_PACKAGES,
  TIER_LABELS,
  TIER_ORDER,
  type EvidenceTier,
} from '../data/evidencePackages'
import type { EvidenceItem } from '../lib/types'

export function EvidencePicker({
  evidence,
  onAdd,
  onRemove,
  only,
  addedDuring,
}: {
  evidence: EvidenceItem[]
  onAdd: (packageId: string, name: string, example?: string) => void
  onRemove: (id: string) => void
  /** When set, show only these packages (used for inline gap filling). */
  only?: string[]
  addedDuring: 'intake' | 'review'
}) {
  const packages = only
    ? EVIDENCE_PACKAGES.filter((p) => only.includes(p.id))
    : EVIDENCE_PACKAGES
  const tiers = TIER_ORDER.filter((t) => packages.some((p) => p.tier === t))

  return (
    <div>
      {tiers.map((tier) => (
        <section key={tier} className="tier">
          {!only && <h4 className="tier-head">{TIER_LABELS[tier as EvidenceTier]}</h4>}
          {packages
            .filter((p) => p.tier === tier)
            .map((pkg) => (
              <PackageRow
                key={pkg.id}
                pkgId={pkg.id}
                name={pkg.name}
                examples={pkg.examples}
                files={evidence.filter((e) => e.packageId === pkg.id)}
                onAdd={(docName, example) => onAdd(pkg.id, docName, example)}
                onRemove={onRemove}
                startOpen={Boolean(only)}
                addedDuring={addedDuring}
              />
            ))}
        </section>
      ))}
    </div>
  )
}

function PackageRow({
  pkgId,
  name,
  examples,
  files,
  onAdd,
  onRemove,
  startOpen,
}: {
  pkgId: string
  name: string
  examples: string[]
  files: EvidenceItem[]
  onAdd: (docName: string, example?: string) => void
  onRemove: (id: string) => void
  startOpen: boolean
  addedDuring: 'intake' | 'review'
}) {
  const [open, setOpen] = useState(startOpen)
  const [docName, setDocName] = useState('')
  const [example, setExample] = useState('')

  function add() {
    const trimmed = docName.trim()
    if (!trimmed) return
    onAdd(trimmed, example || undefined)
    setDocName('')
    setExample('')
  }

  return (
    <div className={`pkg${files.length ? ' has-files' : ''}`}>
      <button
        className="pkg-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`pkg-${pkgId}`}
      >
        <span className="caret" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        <span className="name">{name}</span>
        <span className="count">
          {files.length > 0 ? (
            <span className="badge low">
              {files.length} document{files.length === 1 ? '' : 's'}
            </span>
          ) : (
            <span className="badge na plain">Not received</span>
          )}
        </span>
      </button>

      {open && (
        <div className="pkg-body" id={`pkg-${pkgId}`}>
          <p className="tiny muted" style={{ margin: '8px 0 2px' }}>
            Evidence examples, most relevant first:
          </p>
          <ul className="example-list">
            {examples.map((ex) => (
              <li key={ex}>{ex}</li>
            ))}
          </ul>

          {files.length > 0 && (
            <ul className="file-list">
              {files.map((f) => (
                <li key={f.id} className="file-row">
                  <span className="fname">{f.name}</span>
                  {f.example && <span className="fmeta">{f.example}</span>}
                  <button onClick={() => onRemove(f.id)} aria-label={`Remove ${f.name}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="add-doc">
            <input
              type="text"
              value={docName}
              placeholder="Document name, e.g. Acme_SOC2_TypeII_2026.pdf"
              onChange={(e) => setDocName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              aria-label={`Document received for ${name}`}
            />
            <select
              value={example}
              onChange={(e) => setExample(e.target.value)}
              aria-label={`Evidence example for ${name}`}
            >
              <option value="">Which example? (optional)</option>
              {examples.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
            <button className="btn sm" onClick={add} disabled={!docName.trim()}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
