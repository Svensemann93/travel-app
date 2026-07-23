import { act, fireEvent, renderWithProviders, screen } from '../test/utils'
import type { ReviewPhoto } from '../lib/yearReview'
import YearReviewPhotos from './YearReviewPhotos'

vi.mock('../hooks/useSignedUrl', () => ({
  useSignedUrl: (path: string) => path,
}))

function makePhotos(count: number, prefix = 'Place'): ReviewPhoto[] {
  return Array.from({ length: count }, (_, i) => ({
    path: `${prefix}-${i}.jpg`,
    placeId: `${prefix}-id-${i}`,
    name: `${prefix} ${i}`,
  }))
}

function labelOfFirstTile(): string | null {
  return screen.getAllByRole('button')[0].getAttribute('aria-label')
}

function tileLabels(): (string | null)[] {
  return screen.getAllByRole('button').map((tile) => tile.getAttribute('aria-label'))
}

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('YearReviewPhotos', () => {
  it('renders nothing without photos', () => {
    const { container } = renderWithProviders(<YearReviewPhotos photos={[]} onSelect={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('caps the mosaic at nine tiles', () => {
    renderWithProviders(<YearReviewPhotos photos={makePhotos(30)} onSelect={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(9)
  })

  it('renders one tile per photo when there are fewer than nine', () => {
    renderWithProviders(<YearReviewPhotos photos={makePhotos(4)} onSelect={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('labels every tile with the place it currently shows', () => {
    renderWithProviders(<YearReviewPhotos photos={makePhotos(3)} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Place 0/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Place 1/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Place 2/ })).toBeInTheDocument()
  })

  it('reports the place of the tile that was clicked', () => {
    const onSelect = vi.fn()
    renderWithProviders(<YearReviewPhotos photos={makePhotos(3)} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /Place 1/ }))
    expect(onSelect).toHaveBeenCalledWith('Place-id-1')
  })

  it('moves a tile to another photo once its interval elapses', () => {
    vi.useFakeTimers()
    renderWithProviders(<YearReviewPhotos photos={makePhotos(18)} onSelect={vi.fn()} />)
    const before = labelOfFirstTile()
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(labelOfFirstTile()).not.toBe(before)
  })

  it('stays still when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.useFakeTimers()
    renderWithProviders(<YearReviewPhotos photos={makePhotos(18)} onSelect={vi.fn()} />)
    const before = labelOfFirstTile()
    act(() => {
      vi.advanceTimersByTime(120000)
    })
    expect(labelOfFirstTile()).toBe(before)
  })

  it('keeps rotating past the first tile when photos barely outnumber the tiles', () => {
    vi.useFakeTimers()
    renderWithProviders(<YearReviewPhotos photos={makePhotos(10)} onSelect={vi.fn()} />)
    const before = tileLabels()

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(tileLabels()[0]).not.toBe(before[0])

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(tileLabels()[1]).not.toBe(before[1])

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(tileLabels()[2]).not.toBe(before[2])
  })

  it('brings the photo that started off-screen into the mosaic', () => {
    vi.useFakeTimers()
    const photos = makePhotos(10)
    renderWithProviders(<YearReviewPhotos photos={photos} onSelect={vi.fn()} />)
    const shownFirst = tileLabels()
    const hidden = photos.find((photo) => !shownFirst.some((label) => label?.includes(photo.name)))
    expect(hidden).toBeDefined()

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(tileLabels().some((label) => label?.includes(hidden!.name))).toBe(true)
  })

  it('never shows the same photo in two tiles at once', () => {
    vi.useFakeTimers()
    renderWithProviders(<YearReviewPhotos photos={makePhotos(10)} onSelect={vi.fn()} />)
    for (let tick = 0; tick < 12; tick += 1) {
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      const labels = tileLabels()
      expect(new Set(labels).size).toBe(labels.length)
    }
  })

  it('keeps a working click target after the photo set shrinks mid-rotation', () => {
    vi.useFakeTimers()
    const onSelect = vi.fn()
    const { rerender } = renderWithProviders(
      <YearReviewPhotos photos={makePhotos(18)} onSelect={onSelect} />,
    )
    act(() => {
      vi.advanceTimersByTime(20000)
    })
    rerender(<YearReviewPhotos photos={makePhotos(1, 'Other')} onSelect={onSelect} />)
    vi.useRealTimers()

    fireEvent.click(screen.getByRole('button', { name: /Other 0/ }))
    expect(onSelect).toHaveBeenCalledWith('Other-id-0')
  })
})
