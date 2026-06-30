export function parseLocalDate(dateString: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (dateOnly) {
    const [, year, month, day] = dateOnly
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  return new Date(dateString)
}

type RangePrefixes = {
  from: string
  until: string
}

export function formatDate(dateString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseLocalDate(dateString))
}

export function formatDateLong(dateString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseLocalDate(dateString))
}

export function formatDateRange(
  start: string | null,
  end: string | null,
  locale: string,
  prefixes: RangePrefixes,
): string | null {
  if (!start && !end) return null
  const fmt = (d: string) => formatDateLong(d, locale)
  if (start && end) {
    if (start === end) return fmt(start)
    return `${fmt(start)} – ${fmt(end)}`
  }
  if (start) return `${prefixes.from} ${fmt(start)}`
  return `${prefixes.until} ${fmt(end!)}`
}
