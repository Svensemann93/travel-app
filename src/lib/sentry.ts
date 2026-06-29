import * as Sentry from '@sentry/react'

export function initSentry(): void {
  if (!import.meta.env.PROD) {
    return
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    ignoreErrors: [
      "Failed to execute 'removeChild' on 'Node'",
      'Lock broken by another request',
      /Lock .* was released because/,
    ],
  })
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  Sentry.captureException(error, context ? { extra: context } : undefined)
}
