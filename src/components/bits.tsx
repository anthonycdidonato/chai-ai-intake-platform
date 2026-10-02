import type { ResponseValue } from '../data/riskData'

export function levelClass(level: ResponseValue | string): string {
  switch (level) {
    case 'Low':
      return 'low'
    case 'Medium':
      return 'medium'
    case 'High':
      return 'high'
    case 'N/A':
      return 'na'
    default:
      return 'needsinfo'
  }
}

export function LevelBadge({ level, big }: { level: ResponseValue | string; big?: boolean }) {
  const cls = levelClass(level)
  const map: Record<string, string> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    na: 'na',
    needsinfo: 'info',
  }
  return (
    <span className={`badge ${map[cls]}${big ? ' big' : ''}`}>
      {level === 'Need More Info' ? 'Needs more information' : level}
    </span>
  )
}
