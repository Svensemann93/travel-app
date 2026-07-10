import type { CategoryId } from '../lib/categories'

export type PlacePhoto = {
  id: string
  place_id: string
  user_id: string
  url: string
  thumb_url: string | null
  position: number
  is_public: boolean
  created_at: string
}

export type NewPhoto = {
  file: File
  isPublic: boolean
}

export type Place = {
  id: string
  user_id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  category: CategoryId
  rating: number | null
  price_level: number | null
  website_url: string | null
  is_public: boolean
  country_code: string | null
  created_at: string
  photos: PlacePhoto[]
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
  rating: number | null
  price_level: number | null
  website_url: string | null
  username: string | null
  country_code: string | null
  photos: PublicPlacePhoto[]
  avg_rating: number | null
  avg_price: number | null
  visit_count: number
  my_rating: number | null
  my_price: number | null
  visited_by_me: boolean
}

export type PlaceUpdateInput = {
  name: string
  description: string | null
  category: CategoryId
  rating: number | null
  price_level: number | null
  website_url: string | null
  is_public: boolean
}

export type PlaceCreateInput = PlaceUpdateInput & {
  latitude: number
  longitude: number
  country_code?: string | null
}
