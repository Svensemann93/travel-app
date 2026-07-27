import type { CategoryId } from '../lib/categories'
import type { Database } from './database'

type Tables = Database['public']['Tables']

export type PlacePhoto = Tables['place_photos']['Row']

export type NewPhoto = {
  file: File
  isPublic: boolean
}

export type PlaceVisit = Tables['place_visits']['Row']

export type Place = Omit<Tables['places']['Row'], 'category'> & {
  category: CategoryId
  photos: PlacePhoto[]
  visits: PlaceVisit[]
}

export type PublicPlacePhoto = {
  id: string
  url: string
  thumb_url: string | null
}

export type PublicPlace = {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  category: CategoryId
  website_url: string | null
  username: string | null
  country_code: string | null
  photos: PublicPlacePhoto[]
  avg_rating: number | null
  avg_price: number | null
  visit_count: number
  my_rating: number | null
  my_price: number | null
  my_visited_on: string | null
  visited_by_me: boolean
  wished_by_me: boolean
  wished_on: string | null
}

export type VisitedPlace = {
  place_id: string | null
  name: string
  category: CategoryId
  country_code: string | null
  latitude: number | null
  longitude: number | null
  rating: number | null
  visited_on: string | null
  created_at: string
}

export type VisitInput = {
  rating: number | null
  price_level: number | null
  visited_on: string | null
}

export type PlaceUpdateInput = {
  name: string
  description: string | null
  category: CategoryId
  website_url: string | null
  is_public: boolean
}

export type PlaceCreateInput = PlaceUpdateInput & {
  latitude: number
  longitude: number
  country_code?: string | null
}
