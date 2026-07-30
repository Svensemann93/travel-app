export function clampFocus(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}
