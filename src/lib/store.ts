// Persistence. The prototype keeps one working review in the browser so you can
// close the tab and pick it up again; nothing is transmitted anywhere.

import type { Assessment } from './types'

const KEY = 'chai-ai-intake:v2:current'

export function save(a: Assessment) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a))
  } catch {
    /* private browsing — the review stays in memory for this tab only */
  }
}

export function load(): Assessment | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Assessment
    return parsed && parsed.id ? parsed : null
  } catch {
    return null
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
}
