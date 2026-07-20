import type { Place } from './place'

export type Trip = {
  id: string
  user_id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  cover_photo_path: string | null
  cover_focus_x: number
  cover_focus_y: number
  created_at: string
  updated_at: string
}

export type TripListItem = Trip & {
  place_count: number
}

export type TripPlace = {
  trip_id: string
  place_id: string
  position: number
  planned_date: string | null
  notes: string | null
  created_at: string
  place_name: string | null
  place_latitude: number | null
  place_longitude: number | null
  place_category: string | null
  place_country_code: string | null
}

export type TripPlaceWithPlace = TripPlace & {
  place: Place
  is_foreign: boolean
}

export type TripWithPlaces = Trip & {
  trip_places: TripPlaceWithPlace[]
}

export type TripCandidate = {
  id: string
  name: string
}

export type TripInput = {
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
}

export type TripPlaceUpdateInput = {
  planned_date: string | null
  notes: string | null
}
