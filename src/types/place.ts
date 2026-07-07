import type { CategoryId } from '../lib/categories'

export type PlacePhoto = {
  id: string
  place_id: string
  user_id: string
  url: string
  thumb_url: string | null
  position: number
  created_at: string
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
  created_at: string
  photos: PlacePhoto[]
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
}
