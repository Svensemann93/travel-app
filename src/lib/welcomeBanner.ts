const KEY = 'welcomeDismissed'

export function isWelcomeDismissed(): boolean {
  return sessionStorage.getItem(KEY) === '1'
}

export function dismissWelcome(): void {
  sessionStorage.setItem(KEY, '1')
}

export function resetWelcome(): void {
  sessionStorage.removeItem(KEY)
}
