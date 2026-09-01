/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional REST backend for session persistence. See ./server. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
