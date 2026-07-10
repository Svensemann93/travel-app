const KEY = 'achievementsSeen'

export function loadSeen(): string[] | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : null
  } catch {
    return null
  }
}

export function saveSeen(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // storage unavailable; skip persistence
  }
}
