import type { Place } from './place'

export type Trip = {
  id: string
  user_id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export type TripPlace = {
  trip_id: string
  place_id: string
  position: number
  planned_date: string | null
  notes: string | null
  created_at: string
}

export type TripPlaceWithPlace = TripPlace & {
  place: Place
}

export type TripWithPlaces = Trip & {
  trip_places: TripPlaceWithPlace[]
}

export type TripInput = {
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
}
