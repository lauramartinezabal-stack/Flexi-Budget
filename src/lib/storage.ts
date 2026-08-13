import type { AppState } from './types'

const STORAGE_KEY = 'flexi-budget:state:v1'

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppState
  } catch {
    return null
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — fail silently, data stays in memory for the session
  }
}

export function emptyState(): AppState {
  return { entries: [], notifications: [] }
}
