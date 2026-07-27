import type { Place } from './place'
import type { Database } from './database'

type Tables = Database['public']['Tables']

export type Trip = Tables['trips']['Row']

export type TripListItem = Trip & {
  place_count: number
  first_stop: { latitude: number; longitude: number } | null
}

export type TripPlace = Tables['trip_places']['Row']

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
