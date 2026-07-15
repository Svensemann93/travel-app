import type { Place, VisitedPlace } from '../types/place'
import type { Trip } from '../types/trip'
import type { Journal } from '../types/journal'
import type { CategoryId } from './categories'
import { COUNTRY_CONTINENT } from './continents'

export type YearSelection = number | 'all'

export type ReviewPhoto = {
  path: string
  placeId: string
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
  let highlight: YearReview['highlight'] = null

  const collect = (
    category: CategoryId,
    countryCode: string | null,
    name: string,
    rating: number | null,
  ) => {
    if (countryCode) {
      countries.add(countryCode)
      const continent = COUNTRY_CONTINENT[countryCode]
      if (continent) continents.add(continent)
    }
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    if (rating != null && (!highlight || rating > highlight.rating)) {
      highlight = { name, countryCode, rating }
    }
  }

  for (const place of selectedPlaces) {
    collect(place.category, place.country_code, place.name, place.rating)
  }
  for (const visit of selectedVisits) {
    collect(visit.category, visit.country_code, visit.name, visit.rating)
  }

  const placesWithPhotos = selectedPlaces.filter((place) => place.photos.length > 0)
  const photos: ReviewPhoto[] = []
  for (let round = 0; ; round += 1) {
    let added = false
    for (const place of placesWithPhotos) {
      const photo = place.photos[round]
      if (!photo) continue
      photos.push({ path: photo.thumb_url ?? photo.url, placeId: place.id })
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
  const journalCount = journals.filter((journal) =>
    inSelection(yearOf(journal.created_at), selection),
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
  for (const journal of journals) add(journal.created_at)
  years.add(new Date().getFullYear())
  return [...years].sort((a, b) => b - a)
}
