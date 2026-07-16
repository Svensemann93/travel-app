import type { Place, VisitedPlace } from '../types/place'
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

function placeYear(place: Place): number | null {
  return yearOf(place.visited_on ?? place.created_at)
}

function visitYear(visit: VisitedPlace): number | null {
  return yearOf(visit.visited_on ?? visit.created_at)
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
  const selectedPlaces = places.filter((place) => inSelection(placeYear(place), selection))
  const selectedVisits = visits.filter((visit) => inSelection(visitYear(visit), selection))
  const countries = new Set<string>()
  const continents = new Set<string>()
  const categoryCounts = new Map<CategoryId, number>()

  const rated: BestPlace[] = []

  const collect = (
    category: CategoryId,
    countryCode: string | null,
    name: string,
    rating: number | null,
    date: string,
  ) => {
    if (countryCode) {
      countries.add(countryCode)
      const continent = COUNTRY_CONTINENT[countryCode]
      if (continent) continents.add(continent)
    }
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    if (rating == null) return
    rated.push({ name, countryCode, rating, date: date.slice(0, 10) })
  }

  for (const place of selectedPlaces) {
    collect(
      place.category,
      place.country_code,
      place.name,
      place.rating,
      place.visited_on ?? place.created_at,
    )
  }
  for (const visit of selectedVisits) {
    collect(
      visit.category,
      visit.country_code,
      visit.name,
      visit.rating,
      visit.visited_on ?? visit.created_at,
    )
  }
  let best: BestPlace | null = null
  for (const candidate of rated) {
    if (!best || beats(candidate, best)) best = candidate
  }
  const highlight: YearReview['highlight'] = best
    ? { name: best.name, countryCode: best.countryCode, rating: best.rating }
    : null

  const placesWithPhotos = selectedPlaces.filter((place) => place.photos.length > 0)
  const photos: ReviewPhoto[] = []
  for (let round = 0; ; round += 1) {
    let added = false
    for (const place of placesWithPhotos) {
      const photo = place.photos[round]
      if (!photo) continue
      photos.push({ path: photo.thumb_url ?? photo.url, placeId: place.id, name: place.name })
      added = true
    }
    if (!added) break
  }

  let photoCount = 0
  for (const place of selectedPlaces) {
    photoCount += place.photos.length
  }

  let newCountryCount = 0
  if (selection !== 'all') {
    const firstYear = new Map<string, number>()
    const noteFirst = (code: string | null, year: number | null) => {
      if (!code || year == null) return
      const prev = firstYear.get(code)
      if (prev == null || year < prev) firstYear.set(code, year)
    }
    for (const place of places) noteFirst(place.country_code, placeYear(place))
    for (const visit of visits) noteFirst(visit.country_code, visitYear(visit))
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
    placeCount: selectedPlaces.length + selectedVisits.length,
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
  const add = (iso: string | null | undefined) => {
    const year = yearOf(iso)
    if (year != null) years.add(year)
  }
  for (const place of places) add(place.visited_on ?? place.created_at)
  for (const visit of visits) add(visit.visited_on ?? visit.created_at)
  for (const trip of trips) add(trip.start_date ?? trip.created_at)
  const tripStarts = tripStartMap(trips)
  for (const journal of journals) {
    const year = journalYear(journal, tripStarts)
    if (year != null) years.add(year)
  }
  years.add(new Date().getFullYear())
  return [...years].sort((a, b) => b - a)
}
