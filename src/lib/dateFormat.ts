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

export function formatWeekday(dateString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(dateString))
}

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['week', 7 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

export function formatRelative(dateString: string, locale: string, now = new Date()): string {
  const elapsed = parseLocalDate(dateString).getTime() - now.getTime()
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  for (const [unit, size] of RELATIVE_STEPS) {
    if (Math.abs(elapsed) >= size) {
      return formatter.format(Math.round(elapsed / size), unit)
    }
  }

  return formatter.format(0, 'minute')
}
