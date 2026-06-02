import { formatDate, formatDateRange, parseLocalDate } from './dateFormat'

describe('formatDateRange', () => {
  it('returns null when both inputs are null', () => {
    expect(formatDateRange(null, null)).toBeNull()
  })

  it('joins both dates with an en-dash when both are set', () => {
    const result = formatDateRange('2025-01-15', '2025-01-20')
    expect(result).toContain('–')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/20/)
  })

  it('uses "ab" prefix when only start is set', () => {
    expect(formatDateRange('2025-01-15', null)).toMatch(/^ab /)
  })

  it('uses "bis" prefix when only end is set', () => {
    expect(formatDateRange(null, '2025-01-20')).toMatch(/^bis /)
  })
})

describe('formatDate', () => {
  it('includes the day in the output', () => {
    expect(formatDate('2025-01-15')).toMatch(/15/)
  })

  it('includes the year in the output', () => {
    expect(formatDate('2025-01-15')).toMatch(/2025/)
  })

  it('returns a non-empty string', () => {
    const result = formatDate('2025-01-15')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
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
    const result = formatDate('2025-01-15')
    expect(result).toMatch(/15/)
    expect(result).not.toMatch(/14/)
  })

  it('formatDateRange does not roll the day back', () => {
    const result = formatDateRange('2025-01-15', '2025-01-20')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/20/)
    expect(result).not.toMatch(/14/)
  })
})