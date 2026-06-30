import { formatDate, formatDateLong, formatDateRange, parseLocalDate } from './dateFormat'

const PREFIXES = { from: 'from', until: 'until' }

describe('formatDateRange', () => {
  it('returns null when both inputs are null', () => {
    expect(formatDateRange(null, null, 'en-US', PREFIXES)).toBeNull()
  })

  it('joins both dates with an en-dash when both are set and differ', () => {
    const result = formatDateRange('2025-01-15', '2025-01-20', 'en-US', PREFIXES)
    expect(result).toContain('–')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/20/)
  })

  it('shows a single date when start and end are equal', () => {
    const result = formatDateRange('2025-01-15', '2025-01-15', 'en-US', PREFIXES)
    expect(result).not.toContain('–')
    expect(result).toMatch(/15/)
  })

  it('uses the from prefix when only start is set', () => {
    expect(formatDateRange('2025-01-15', null, 'en-US', PREFIXES)).toMatch(/^from /)
  })

  it('uses the until prefix when only end is set', () => {
    expect(formatDateRange(null, '2025-01-20', 'en-US', PREFIXES)).toMatch(/^until /)
  })
})

describe('formatDate', () => {
  it('includes the day in the output', () => {
    expect(formatDate('2025-01-15', 'en-US')).toMatch(/15/)
  })

  it('includes the year in the output', () => {
    expect(formatDate('2025-01-15', 'en-US')).toMatch(/2025/)
  })

  it('formats in US English with month first', () => {
    expect(formatDate('2025-01-15', 'en-US')).toMatch(/Jan/)
  })
})

describe('formatDateLong', () => {
  it('uses the full month name in US English', () => {
    expect(formatDateLong('2025-01-15', 'en-US')).toMatch(/January/)
  })

  it('uses the full month name in Swiss German', () => {
    expect(formatDateLong('2025-01-15', 'de-CH')).toMatch(/Januar/)
  })

  it('omits the weekday', () => {
    const result = formatDateLong('2025-01-15', 'en-US')
    expect(result).not.toMatch(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/)
  })
})

describe('date-only timezone safety', () => {
  beforeAll(() => {
    vi.stubEnv('TZ', 'Pacific/Honolulu')
  })
  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('parseLocalDate keeps the exact calendar date', () => {
    const d = parseLocalDate('2025-01-15')
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(15)
  })

  it('formatDate does not roll the day back', () => {
    const result = formatDate('2025-01-15', 'en-US')
    expect(result).toMatch(/15/)
    expect(result).not.toMatch(/14/)
  })

  it('formatDateRange does not roll the day back', () => {
    const result = formatDateRange('2025-01-15', '2025-01-20', 'en-US', PREFIXES)
    expect(result).toMatch(/15/)
    expect(result).toMatch(/20/)
    expect(result).not.toMatch(/14/)
  })
})
