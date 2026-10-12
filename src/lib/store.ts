import type { Assessment } from './types'
const KEY = 'chai-ai-intake:v3'
export function save(a: Assessment) { try { localStorage.setItem(KEY, JSON.stringify(a)) } catch { /* private mode */ } }
export function load(): Assessment | null { try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as Assessment) : null } catch { return null } }
export function clear() { try { localStorage.removeItem(KEY) } catch { /* nothing */ } }
