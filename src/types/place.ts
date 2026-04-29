export type PlacePhoto = {
  id: string
  place_id: string
  user_id: string
  url: string
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
  rating: number | null
  price_level: number | null
  website_url: string | null
  created_at: string
  photos: PlacePhoto[]
}
