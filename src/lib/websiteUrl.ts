export type WebsiteUrlResult = { ok: true; value: string | null } | { ok: false }

function tryParse(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export function normalizeWebsiteUrl(raw: string): WebsiteUrlResult {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: true, value: null }

  const explicit = tryParse(trimmed)
  if (explicit && (explicit.protocol === 'http:' || explicit.protocol === 'https:')) {
    return { ok: true, value: explicit.href }
  }
  if (explicit) return { ok: false }

  const prefixed = tryParse(`https://${trimmed}`)
  if (prefixed && (prefixed.protocol === 'http:' || prefixed.protocol === 'https:')) {
    return { ok: true, value: prefixed.href }
  }

  return { ok: false }
}
