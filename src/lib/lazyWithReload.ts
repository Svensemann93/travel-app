import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

const RELOAD_KEY = 'chunk-reload-attempt'

export function lazyWithReload<T extends ComponentType<object>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(() =>
    factory().then(
      (module) => {
        sessionStorage.removeItem(RELOAD_KEY)
        return module
      },
      (error: unknown) => {
        if (!sessionStorage.getItem(RELOAD_KEY)) {
          sessionStorage.setItem(RELOAD_KEY, '1')
          window.location.reload()
          return new Promise<{ default: T }>(() => undefined)
        }
        sessionStorage.removeItem(RELOAD_KEY)
        throw error
      },
    ),
  )
}
