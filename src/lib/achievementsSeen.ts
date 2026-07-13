function keyFor(userId: string): string {
  return `achievementsSeen:${userId}`
}

export function loadSeen(userId: string): string[] | null {
  try {
    const raw = localStorage.getItem(keyFor(userId))
    return raw ? (JSON.parse(raw) as string[]) : null
  } catch {
    return null
  }
}

export function saveSeen(userId: string, ids: string[]): void {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(ids))
  } catch {
    // storage unavailable; skip persistence
  }
}

export function reconcileSeen(
  earnedIds: string[],
  seen: string[],
): { fresh: string[]; nextSeen: string[] } {
  const seenSet = new Set(seen)
  const fresh = earnedIds.filter((id) => !seenSet.has(id))
  return { fresh, nextSeen: fresh.length > 0 ? [...seen, ...fresh] : seen }
}
