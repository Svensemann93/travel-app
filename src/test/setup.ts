import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import '../lib/i18n'

afterEach(() => {
  cleanup()
})
