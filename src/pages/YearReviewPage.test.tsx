import type { UseQueryResult } from '@tanstack/react-query'
import { fireEvent, renderWithProviders, screen, within } from '../test/utils'
import { makePlace } from '../test/fixtures'
import { useJournals } from '../hooks/useJournals'
import { useMyVisitedStats } from '../hooks/useMyVisitedStats'
import { usePlaces } from '../hooks/usePlaces'
import { useTrips } from '../hooks/useTrips'
import YearReviewPage from './YearReviewPage'

vi.mock('../hooks/usePlaces', () => ({ usePlaces: vi.fn() }))
vi.mock('../hooks/useTrips', () => ({ useTrips: vi.fn() }))
vi.mock('../hooks/useJournals', () => ({ useJournals: vi.fn() }))
vi.mock('../hooks/useMyVisitedStats', () => ({ useMyVisitedStats: vi.fn() }))
vi.mock('../components/AppHeader', () => ({ default: () => null }))
vi.mock('../hooks/useSignedUrl', () => ({ useSignedUrl: (path: string) => path }))

type AnyQuery = UseQueryResult<unknown, Error>

function queryResult(overrides: Partial<AnyQuery> = {}): AnyQuery {
  return {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as AnyQuery
}

function mockQueries(
  overrides: Partial<Record<'places' | 'trips' | 'journals' | 'visits', AnyQuery>> = {},
) {
  vi.mocked(usePlaces).mockReturnValue(
    (overrides.places ?? queryResult()) as ReturnType<typeof usePlaces>,
  )
  vi.mocked(useTrips).mockReturnValue(
    (overrides.trips ?? queryResult()) as ReturnType<typeof useTrips>,
  )
  vi.mocked(useJournals).mockReturnValue(
    (overrides.journals ?? queryResult()) as ReturnType<typeof useJournals>,
  )
  vi.mocked(useMyVisitedStats).mockReturnValue(
    (overrides.visits ?? queryResult()) as ReturnType<typeof useMyVisitedStats>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('YearReviewPage', () => {
  it('shows a loading state while any query is still loading', () => {
    mockQueries({ visits: queryResult({ isLoading: true }) })
    renderWithProviders(<YearReviewPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('surfaces a failing query instead of rendering an incomplete review', () => {
    mockQueries({
      visits: queryResult({ isError: true, error: new Error('visits are down') }),
    })
    renderWithProviders(<YearReviewPage />)
    expect(screen.getByRole('alert')).toHaveTextContent('visits are down')
  })

  it('retries every query when the error state offers a retry', () => {
    const refetchPlaces = vi.fn()
    const refetchVisits = vi.fn()
    mockQueries({
      places: queryResult({ refetch: refetchPlaces }),
      visits: queryResult({ isError: true, error: new Error('nope'), refetch: refetchVisits }),
    })
    renderWithProviders(<YearReviewPage />)

    fireEvent.click(within(screen.getByRole('alert')).getByRole('button'))
    expect(refetchPlaces).toHaveBeenCalled()
    expect(refetchVisits).toHaveBeenCalled()
  })

  it('renders the review once the data is there', () => {
    mockQueries({
      places: queryResult({
        data: [makePlace({ name: 'Cinque Terre', rating: 5, country_code: 'IT' })],
      }),
    })
    renderWithProviders(<YearReviewPage />)
    expect(screen.getByText('Cinque Terre')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('narrows the review to the selected year', () => {
    mockQueries({
      places: queryResult({
        data: [
          makePlace({ name: 'Old trip', visited_on: '2019-05-05', rating: 5 }),
          makePlace({ name: 'New trip', visited_on: '2024-05-05', rating: 4 }),
        ],
      }),
    })
    renderWithProviders(<YearReviewPage />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2019' } })
    expect(screen.getByText('Old trip')).toBeInTheDocument()
    expect(screen.queryByText('New trip')).not.toBeInTheDocument()
  })
})
