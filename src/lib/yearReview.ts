import type { Place, PlacePhoto, VisitedPlace } from '../types/place'
import type { Trip } from '../types/trip'
import type { Journal } from '../types/journal'
import type { CategoryId } from './categories'
import { COUNTRY_CONTINENT } from './continents'

export type YearSelection = number | 'all'

export type ReviewPhoto = {
  path: string
  placeId: string
  name: string
}

export type YearReview = {
  year: YearSelection
  placeCount: number
  countryCount: number
  newCountryCount: number
  continentCount: number
  tripCount: number
  journalCount: number
  photoCount: number
  topCategory: { id: CategoryId; count: number } | null
  highlight: { name: string; countryCode: string | null; rating: number } | null
  photos: ReviewPhoto[]
}

function yearOf(iso: string | null | undefined): number | null {
  if (!iso || iso.length < 4) return null
  const year = Number(iso.slice(0, 4))
  return Number.isInteger(year) ? year : null
}

function inSelection(year: number | null, selection: YearSelection): boolean {
  if (year == null) return false
  return selection === 'all' || year === selection
}

type VisitEvent = {
  placeId: string
  name: string
  category: CategoryId
  countryCode: string | null
  rating: number | null
  date: string
  photos: PlacePhoto[]
}

function visitEvents(places: Place[], visits: VisitedPlace[]): VisitEvent[] {
  const events: VisitEvent[] = []
  for (const place of places) {
    for (const visit of place.visits) {
      events.push({
        placeId: place.id,
        name: place.name,
        category: place.category,
        countryCode: place.country_code,
        rating: visit.rating,
        date: visit.visited_on ?? visit.created_at,
        photos: place.photos ?? [],
      })
    }
  }
  for (const visit of visits) {
    events.push({
      placeId: visit.place_id ?? visit.name,
      name: visit.name,
      category: visit.category,
      countryCode: visit.country_code,
      rating: visit.rating,
      date: visit.visited_on ?? visit.created_at,
      photos: [],
    })
  }
  return events
}

function eventYear(event: VisitEvent): number | null {
  return yearOf(event.date)
}

function tripStartMap(trips: Trip[]): Map<string, string> {
  const starts = new Map<string, string>()
  for (const trip of trips) {
    if (trip.start_date) starts.set(trip.id, trip.start_date)
  }
  return starts
}

function journalYear(journal: Journal, tripStarts: Map<string, string>): number | null {
  const tripStart = journal.trip_id ? tripStarts.get(journal.trip_id) : undefined
  return yearOf(tripStart ?? journal.created_at)
}

type BestPlace = {
  name: string
  countryCode: string | null
  rating: number
  date: string
}

function beats(candidate: BestPlace, best: BestPlace): boolean {
  if (candidate.rating !== best.rating) return candidate.rating > best.rating
  if (candidate.date !== best.date) return candidate.date > best.date
  return candidate.name.localeCompare(best.name) < 0
}

export function computeYearReview(
  places: Place[],
  visits: VisitedPlace[],
  trips: Trip[],
  journals: Journal[],
  selection: YearSelection,
): YearReview {
  const events = visitEvents(places, visits)
  const selected = events.filter((event) => inSelection(eventYear(event), selection))
  const countries = new Set<string>()
  const continents = new Set<string>()
  const categoryCounts = new Map<CategoryId, number>()
  const rated: BestPlace[] = []

  for (const event of selected) {
    if (event.countryCode) {
      countries.add(event.countryCode)
      const continent = COUNTRY_CONTINENT[event.countryCode]
      if (continent) continents.add(continent)
    }
    categoryCounts.set(event.category, (categoryCounts.get(event.category) ?? 0) + 1)
    if (event.rating != null) {
      rated.push({
        name: event.name,
        countryCode: event.countryCode,
        rating: event.rating,
        date: event.date.slice(0, 10),
      })
    }
  }

  let best: BestPlace | null = null
  for (const candidate of rated) {
    if (!best || beats(candidate, best)) best = candidate
  }
  const highlight: YearReview['highlight'] = best
    ? { name: best.name, countryCode: best.countryCode, rating: best.rating }
    : null

  const withPhotos = new Map<string, VisitEvent>()
  for (const event of selected) {
    if (event.photos.length > 0 && !withPhotos.has(event.placeId)) {
      withPhotos.set(event.placeId, event)
    }
  }

  const photos: ReviewPhoto[] = []
  for (let round = 0; ; round += 1) {
    let added = false
    for (const event of withPhotos.values()) {
      const photo = event.photos[round]
      if (!photo) continue
      photos.push({ path: photo.thumb_url ?? photo.url, placeId: event.placeId, name: event.name })
      added = true
    }
    if (!added) break
  }

  let photoCount = 0
  for (const event of withPhotos.values()) {
    photoCount += event.photos.length
  }

  let newCountryCount = 0
  if (selection !== 'all') {
    const firstYear = new Map<string, number>()
    for (const event of events) {
      const year = eventYear(event)
      if (!event.countryCode || year == null) continue
      const prev = firstYear.get(event.countryCode)
      if (prev == null || year < prev) firstYear.set(event.countryCode, year)
    }
    for (const code of countries) {
      if (firstYear.get(code) === selection) newCountryCount += 1
    }
  }

  let topCategory: YearReview['topCategory'] = null
  for (const [id, count] of categoryCounts) {
    if (!topCategory || count > topCategory.count) topCategory = { id, count }
  }

  const tripCount = trips.filter((trip) =>
    inSelection(yearOf(trip.start_date ?? trip.created_at), selection),
  ).length
  const tripStarts = tripStartMap(trips)
  const journalCount = journals.filter((journal) =>
    inSelection(journalYear(journal, tripStarts), selection),
  ).length

  return {
    year: selection,
    placeCount: selected.length,
    countryCount: countries.size,
    newCountryCount,
    continentCount: continents.size,
    tripCount,
    journalCount,
    photoCount,
    topCategory,
    highlight,
    photos,
  }
}

export function availableYears(
  places: Place[],
  visits: VisitedPlace[],
  trips: Trip[],
  journals: Journal[],
): number[] {
  const years = new Set<number>()
  const add = (year: number | null) => {
    if (year != null) years.add(year)
  }
  for (const event of visitEvents(places, visits)) add(eventYear(event))
  for (const trip of trips) add(yearOf(trip.start_date ?? trip.created_at))
  const tripStarts = tripStartMap(trips)
  for (const journal of journals) add(journalYear(journal, tripStarts))
  years.add(new Date().getFullYear())
  return [...years].sort((a, b) => b - a)
}
