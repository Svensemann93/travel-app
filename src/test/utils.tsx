/* eslint-disable react-refresh/only-export-components */
import type { ComponentType, ReactElement, ReactNode } from 'react'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string
}

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
}

interface WrapperProps {
  children: ReactNode
}

export function renderWithProviders(
  ui: ReactElement,
  { initialRoute = '/', ...renderOptions }: ProviderOptions = {},
): RenderResult {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export interface TestQueryWrapper {
  wrapper: ComponentType<WrapperProps>
  queryClient: QueryClient
}

export function createTestQueryWrapper(): TestQueryWrapper {
  const queryClient = createTestQueryClient()
  function wrapper({ children }: WrapperProps) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { wrapper, queryClient }
}

export * from '@testing-library/react'
