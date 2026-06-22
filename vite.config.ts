/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        disable: !env.SENTRY_AUTH_TOKEN || !env.VERCEL,
        sourcemaps: {
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
      }),
    ],
    build: {
      sourcemap: 'hidden',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      env: {
        TZ: 'UTC',
      },
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.test.{ts,tsx}',
          '**/*.config.{ts,js}',
          'dist/',
        ],
      },
    },
  }
})
