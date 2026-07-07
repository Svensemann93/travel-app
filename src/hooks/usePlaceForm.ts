import { useState } from 'react'
import { DEFAULT_CATEGORY } from '../lib/categories'
import type { CategoryId } from '../lib/categories'
import type { Place, PlacePhoto } from '../types/place'

export type PlaceFormValues = {
  name: string
  description: string
  category: CategoryId
  rating: number | null
  price_level: number | null
  website_url: string
  isPublic: boolean
  photos: File[]
  photosToDelete: string[]
}

export type PlaceFormInitial = Omit<PlaceFormValues, 'photos' | 'photosToDelete'> & {
  existingPhotos?: PlacePhoto[]
}

export type PlaceFormApi = {
  name: string
  setName: (value: string) => void
  description: string
  setDescription: (value: string) => void
  category: CategoryId
  setCategory: (value: CategoryId) => void
  rating: number | null
  setRating: (value: number | null) => void
  priceLevel: number | null
  setPriceLevel: (value: number | null) => void
  websiteUrl: string
  setWebsiteUrl: (value: string) => void
  isPublic: boolean
  setIsPublic: (value: boolean) => void
  photos: File[]
  existingPhotos: PlacePhoto[]
  addPhotos: (files: File[]) => void
  removeNewPhoto: (index: number) => void
  removeExistingPhoto: (photo: PlacePhoto) => void
  getValues: () => PlaceFormValues
}

export function placeToFormInitial(place: Place): PlaceFormInitial {
  return {
    name: place.name,
    description: place.description ?? '',
    category: place.category,
    rating: place.rating,
    price_level: place.price_level,
    website_url: place.website_url ?? '',
    isPublic: place.is_public,
    existingPhotos: place.photos ?? [],
  }
}

export function usePlaceForm(initialData?: PlaceFormInitial): PlaceFormApi {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [category, setCategory] = useState<CategoryId>(initialData?.category ?? DEFAULT_CATEGORY)
  const [rating, setRating] = useState<number | null>(initialData?.rating ?? null)
  const [priceLevel, setPriceLevel] = useState<number | null>(initialData?.price_level ?? null)
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url ?? '')
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false)
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<PlacePhoto[]>(
    initialData?.existingPhotos ?? [],
  )
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])

  function addPhotos(files: File[]) {
    setPhotos((prev) => [...prev, ...files])
  }

  function removeNewPhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function removeExistingPhoto(photo: PlacePhoto) {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    setPhotosToDelete((prev) => [...prev, photo.id])
  }

  function getValues(): PlaceFormValues {
    return {
      name,
      description,
      category,
      rating: rating === 0 ? null : rating,
      price_level: priceLevel === 0 ? null : priceLevel,
      website_url: websiteUrl,
      isPublic,
      photos,
      photosToDelete,
    }
  }

  return {
    name,
    setName,
    description,
    setDescription,
    category,
    setCategory,
    rating,
    setRating,
    priceLevel,
    setPriceLevel,
    websiteUrl,
    setWebsiteUrl,
    isPublic,
    setIsPublic,
    photos,
    existingPhotos,
    addPhotos,
    removeNewPhoto,
    removeExistingPhoto,
    getValues,
  }
}
