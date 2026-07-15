import type { Place } from '../types/place'
import type { Trip } from '../types/trip'
import type { Journal } from '../types/journal'
import type { CategoryId } from './categories'
import { COUNTRY_CONTINENT } from './continents'

export type YearSelection = number | 'all'

export type ReviewPhoto = {
  path: string
  placeId: string
}

const PHOTO_POOL = 48

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

export function computeYearReview(
  places: Place[],
  trips: Trip[],
  journals: Journal[],
  selection: YearSelection,
): YearReview {
  const selectedPlaces = places.filter((place) => inSelection(yearOf(place.created_at), selection))

  const countries = new Set<string>()
  const continents = new Set<string>()
  const categoryCounts = new Map<CategoryId, number>()
  let highlight: YearReview['highlight'] = null

  for (const place of selectedPlaces) {
    if (place.country_code) {
      countries.add(place.country_code)
      const continent = COUNTRY_CONTINENT[place.country_code]
      if (continent) continents.add(continent)
    }
    categoryCounts.set(place.category, (categoryCounts.get(place.category) ?? 0) + 1)
    if (place.rating != null && (!highlight || place.rating > highlight.rating)) {
      highlight = { name: place.name, countryCode: place.country_code, rating: place.rating }
    }
  }

  const placesWithPhotos = selectedPlaces.filter((place) => place.photos.length > 0)
  const stride = Math.max(1, Math.ceil(placesWithPhotos.length / PHOTO_POOL))
  const photos: ReviewPhoto[] = []
  for (let i = 0; i < placesWithPhotos.length && photos.length < PHOTO_POOL; i += stride) {
    const place = placesWithPhotos[i]
    const photo = place.photos[0]
    photos.push({ path: photo.thumb_url ?? photo.url, placeId: place.id })
  }

  let photoCount = 0
  for (const place of places) {
    for (const photo of place.photos) {
      if (inSelection(yearOf(photo.created_at), selection)) photoCount += 1
    }
  }

  let newCountryCount = 0
  if (selection !== 'all') {
    const firstYear = new Map<string, number>()
    for (const place of places) {
      if (!place.country_code) continue
      const year = yearOf(place.created_at)
      if (year == null) continue
      const prev = firstYear.get(place.country_code)
      if (prev == null || year < prev) firstYear.set(place.country_code, year)
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
  const journalCount = journals.filter((journal) =>
    inSelection(yearOf(journal.created_at), selection),
  ).length

  return {
    year: selection,
    placeCount: selectedPlaces.length,
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

export function availableYears(places: Place[], trips: Trip[], journals: Journal[]): number[] {
  const years = new Set<number>()
  const add = (iso: string | null | undefined) => {
    const year = yearOf(iso)
    if (year != null) years.add(year)
  }
  for (const place of places) add(place.created_at)
  for (const trip of trips) add(trip.start_date ?? trip.created_at)
  for (const journal of journals) add(journal.created_at)
  years.add(new Date().getFullYear())
  return [...years].sort((a, b) => b - a)
}
