import type { Place, PublicPlace } from '../types/place'
import type { CategoryId } from './categories'
import { visitOf } from './placeVisits'

export type ShowcaseTheme = 'all' | 'visited' | 'wishlist' | 'planned'

export type ShowcasePhoto = {
  id: string
  url: string
  thumb_url: string | null
}

export type ShowcasePoint = {
  id: string
  name: string
  category: CategoryId
  latitude: number
  longitude: number
  description: string | null
  website_url: string | null
  rating: number | null
  photos: ShowcasePhoto[]
}

function fromPlace(place: Place): ShowcasePoint {
  const photos = place.photos
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((photo) => ({ id: photo.id, url: photo.url, thumb_url: photo.thumb_url }))

  return {
    id: place.id,
    name: place.name,
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    description: place.description,
    website_url: place.website_url,
    rating: visitOf(place)?.rating ?? null,
    photos,
  }
}

export function placesToPoints(places: Place[]): ShowcasePoint[] {
  return places.map(fromPlace)
}

export function visitedPlacesToPoints(places: Place[]): ShowcasePoint[] {
  return places.filter((place) => place.visits.length > 0).map(fromPlace)
}

export function publicPlacesToPoints(places: PublicPlace[]): ShowcasePoint[] {
  return places.map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    description: place.description,
    website_url: place.website_url,
    rating: place.my_rating,
    photos: place.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      thumb_url: photo.thumb_url,
    })),
  }))
}

export function dedupePoints(points: ShowcasePoint[]): ShowcasePoint[] {
  const seen = new Set<string>()
  return points.filter((point) => {
    if (seen.has(point.id)) return false
    seen.add(point.id)
    return true
  })
}
