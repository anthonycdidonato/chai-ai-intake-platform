import type { ResponseValue } from '../data/riskData'

export function levelClass(level: string | undefined | null): string {
  if (level === 'Low' || level === 'Medium' || level === 'High') return level.toLowerCase()
  if (level === 'N/A') return 'na'
  return 'needsinfo'
}

export function LevelBadge({ level, big }: { level: ResponseValue | string | null | undefined; big?: boolean }) {
  const cls = levelClass(level)
  const tone = cls === 'needsinfo' ? 'info' : cls
  const text = !level ? 'Not determined' : level === 'Need More Info' ? 'Insufficient evidence' : level
  return <span className={`badge ${tone}${big ? ' big' : ''}`}>{text}</span>
}
