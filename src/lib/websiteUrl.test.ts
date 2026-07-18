import { describe, expect, it } from 'vitest'
import { normalizeWebsiteUrl } from './websiteUrl'

describe('normalizeWebsiteUrl', () => {
  it('accepts an https url', () => {
    expect(normalizeWebsiteUrl('https://example.com')).toEqual({
      ok: true,
      value: 'https://example.com/',
    })
  })

  it('accepts http', () => {
    expect(normalizeWebsiteUrl('http://example.com')).toEqual({
      ok: true,
      value: 'http://example.com/',
    })
  })

  it('adds https to a bare domain', () => {
    expect(normalizeWebsiteUrl('example.com')).toEqual({
      ok: true,
      value: 'https://example.com/',
    })
  })

  it('treats empty and whitespace as no url', () => {
    expect(normalizeWebsiteUrl('')).toEqual({ ok: true, value: null })
    expect(normalizeWebsiteUrl('   ')).toEqual({ ok: true, value: null })
  })

  it('rejects a javascript: url', () => {
    expect(normalizeWebsiteUrl('javascript:alert(1)')).toEqual({ ok: false })
  })

  it('rejects data: and other schemes', () => {
    expect(normalizeWebsiteUrl('data:text/html,<script>alert(1)</script>')).toEqual({ ok: false })
    expect(normalizeWebsiteUrl('ftp://example.com')).toEqual({ ok: false })
  })

  it('keeps a port when the scheme is explicit', () => {
    expect(normalizeWebsiteUrl('https://example.com:8080/path')).toEqual({
      ok: true,
      value: 'https://example.com:8080/path',
    })
  })

  it('rejects a bare host:port, which URL reads as an unknown scheme', () => {
    expect(normalizeWebsiteUrl('example.com:8080/path')).toEqual({ ok: false })
  })
})
