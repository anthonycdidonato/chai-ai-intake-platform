// ---------------------------------------------------------------------------
// Session store.
//
// Every intake session — use case description, evidence manifest, per-modifier
// risk categorization, weights, and the final accepted determination — is
// persisted so that both the submitting organization and CHAI administrators
// can review it later.
//
// Two adapters:
//   IndexedDB (default) — the prototype runs entirely in the browser, so nothing
//                         leaves the member's device. This is what the public
//                         GitHub Pages deployment uses.
//   REST (opt-in)       — set VITE_API_BASE_URL and the same calls go to the
//                         reference backend in ./server, which writes to a real
//                         database shared by an organization's colleagues and
//                         CHAI administrators.
// ---------------------------------------------------------------------------

import type { IntakeSession } from './types'

const DB_NAME = 'chai-ai-intake'
const DB_VERSION = 1
const STORE = 'sessions'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')

export const storeMode: 'rest' | 'indexeddb' = API_BASE ? 'rest' : 'indexeddb'

// ------------------------------------------------------------------ IndexedDB

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' })
        os.createIndex('orgName', 'orgName', { unique: false })
        os.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function idbRequest<T>(fn: (store: IDBObjectStore) => IDBRequest<T>, mode: IDBTransactionMode) {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const req = fn(tx.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

// ------------------------------------------------------------------- REST

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

// ------------------------------------------------------------- Public surface

export async function saveSession(session: IntakeSession): Promise<void> {
  if (API_BASE) {
    await rest(`/sessions/${session.id}`, { method: 'PUT', body: JSON.stringify(session) })
    return
  }
  await idbRequest((s) => s.put(session), 'readwrite')
}

export async function loadSession(id: string): Promise<IntakeSession | undefined> {
  if (API_BASE) {
    try {
      return await rest<IntakeSession>(`/sessions/${id}`)
    } catch {
      return undefined
    }
  }
  return idbRequest<IntakeSession | undefined>((s) => s.get(id), 'readonly')
}

export async function listSessions(): Promise<IntakeSession[]> {
  const all = API_BASE
    ? await rest<IntakeSession[]>('/sessions')
    : await idbRequest<IntakeSession[]>((s) => s.getAll(), 'readonly')
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function deleteSession(id: string): Promise<void> {
  if (API_BASE) {
    await rest(`/sessions/${id}`, { method: 'DELETE' })
    return
  }
  await idbRequest((s) => s.delete(id), 'readwrite')
}

/** Id of the session the browser was last working on. */
const LAST_KEY = 'chai-ai-intake:last-session'

export function rememberLastSession(id: string) {
  try {
    localStorage.setItem(LAST_KEY, id)
  } catch {
    /* private browsing — the session is still in the store, just not remembered */
  }
}

export function lastSessionId(): string | null {
  try {
    return localStorage.getItem(LAST_KEY)
  } catch {
    return null
  }
}
