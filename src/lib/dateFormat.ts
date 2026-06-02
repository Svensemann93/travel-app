export function parseLocalDate(dateString: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (dateOnly) {
    const [, year, month, day] = dateOnly
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  return new Date(dateString)
}

export function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null
  const fmt = (d: string) => parseLocalDate(d).toLocaleDateString('de-CH')
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
  }).format(parseLocalDate(dateString))
}
