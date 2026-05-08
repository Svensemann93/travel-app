export function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null
  const fmt = (d: string) => new Date(d).toLocaleDateString('de-CH')
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `ab ${fmt(start)}`
  return `bis ${fmt(end!)}`
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('de-CH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}
