import { useMemo, useRef, useState } from 'react'
import {
  EVIDENCE_PACKAGES,
  TIER_LABELS,
  TIER_ORDER,
  type EvidenceTier,
} from '../data/evidencePackages'
import type { EvidenceFile } from '../lib/types'

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function newId() {
  return `f_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

interface Props {
  evidence: EvidenceFile[]
  onAdd: (files: EvidenceFile[]) => void
  onRemove: (id: string) => void
  /** Which workflow step files added here should be tagged with. */
  stage: 'intake' | 'review'
  /** Package ids to auto-expand — used when jumping here from a gap chip. */
  highlight?: string[]
  /** When set, only these packages are shown (inline gap-filling). */
  only?: string[]
  compact?: boolean
}

export function EvidenceUploader({
  evidence,
  onAdd,
  onRemove,
  stage,
  highlight,
  only,
  compact,
}: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set(highlight ?? []))
  const [dragPkg, setDragPkg] = useState<string | null>(null)
  const inputs = useRef<Record<string, HTMLInputElement | null>>({})

  const packages = useMemo(
    () => (only ? EVIDENCE_PACKAGES.filter((p) => only.includes(p.id)) : EVIDENCE_PACKAGES),
    [only],
  )

  const byPkg = useMemo(() => {
    const m: Record<string, EvidenceFile[]> = {}
    for (const f of evidence) (m[f.packageId] ??= []).push(f)
    return m
  }, [evidence])

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function ingest(packageId: string, fileList: FileList | null, example?: string) {
    if (!fileList || fileList.length === 0) return
    const added: EvidenceFile[] = Array.from(fileList).map((f) => ({
      id: newId(),
      packageId,
      example,
      name: f.name,
      size: f.size,
      type: f.type || f.name.split('.').pop()?.toUpperCase() || 'file',
      uploadedAt: new Date().toISOString(),
      addedDuring: stage,
    }))
    onAdd(added)
    setOpen((prev) => new Set(prev).add(packageId))
  }

  const tiers: EvidenceTier[] = only
    ? TIER_ORDER.filter((t) => packages.some((p) => p.tier === t))
    : TIER_ORDER

  return (
    <div>
      {tiers.map((tier) => (
        <div key={tier} style={{ marginBottom: compact ? 8 : 18 }}>
          {!only && (
            <h4 style={{ marginBottom: 8 }}>
              <span className={`badge tier-${tier} plain`}>{TIER_LABELS[tier]}</span>
            </h4>
          )}
          {packages
            .filter((p) => p.tier === tier)
            .map((pkg) => {
              const files = byPkg[pkg.id] ?? []
              const isOpen = open.has(pkg.id)
              return (
                <div key={pkg.id} className={`pkg${files.length ? ' has-files' : ''}`}>
                  <button
                    className="pkg-head"
                    onClick={() => toggle(pkg.id)}
                    aria-expanded={isOpen}
                  >
                    <span aria-hidden="true" style={{ color: 'var(--medium-blue)', fontSize: '.8rem' }}>
                      {isOpen ? '▾' : '▸'}
                    </span>
                    <span className="name">{pkg.name}</span>
                    <span className="count">
                      {files.length > 0 ? (
                        <span className="badge low plain">
                          {files.length} document{files.length === 1 ? '' : 's'}
                        </span>
                      ) : (
                        <span className="badge na plain">Not supplied</span>
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pkg-body">
                      <p className="tiny muted" style={{ margin: '8px 0 0' }}>
                        Evidence examples, most relevant first:
                      </p>
                      <ul className="example-list">
                        {pkg.examples.map((ex) => (
                          <li key={ex}>{ex}</li>
                        ))}
                      </ul>

                      <div
                        className={`dropzone${dragPkg === pkg.id ? ' over' : ''}`}
                        style={{ padding: 16 }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragPkg(pkg.id)
                        }}
                        onDragLeave={() => setDragPkg(null)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragPkg(null)
                          ingest(pkg.id, e.dataTransfer.files)
                        }}
                      >
                        <p className="small" style={{ margin: '0 0 8px' }}>
                          Drop files here, or
                        </p>
                        <button
                          className="btn secondary sm"
                          onClick={() => inputs.current[pkg.id]?.click()}
                        >
                          Choose files
                        </button>
                        <input
                          ref={(el) => {
                            inputs.current[pkg.id] = el
                          }}
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            ingest(pkg.id, e.target.files)
                            e.target.value = ''
                          }}
                        />
                        <p className="tiny muted" style={{ margin: '8px 0 0' }}>
                          PDF, Word, Excel, PowerPoint, images, diagrams — any file type.
                        </p>
                      </div>

                      {files.length > 0 && (
                        <ul className="file-list">
                          {files.map((f) => (
                            <li key={f.id} className="file-row">
                              <span aria-hidden="true">📄</span>
                              <span className="fname">{f.name}</span>
                              <span className="fmeta">
                                {formatBytes(f.size)}
                                {f.addedDuring === 'review' ? ' · added during review' : ''}
                              </span>
                              <button
                                onClick={() => onRemove(f.id)}
                                aria-label={`Remove ${f.name}`}
                                title="Remove"
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      ))}
    </div>
  )
}
