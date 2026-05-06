export function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null
  const fmt = (d: string) => new Date(d).toLocaleDateString('de-CH')
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `ab ${fmt(start)}`
  return `bis ${fmt(end!)}`
}
