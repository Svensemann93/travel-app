import { useState } from 'react'
import { DEFAULT_CATEGORY } from '../lib/categories'
import type { CategoryId } from '../lib/categories'
import type { NewPhoto, Place, PlacePhoto } from '../types/place'

export type PlaceFormValues = {
  name: string
  description: string
  category: CategoryId
  rating: number | null
  price_level: number | null
  website_url: string
  isPublic: boolean
  newPhotos: NewPhoto[]
  photosToDelete: string[]
  photoVisibility: Record<string, boolean>
}

export type PlaceFormInitial = Omit<
  PlaceFormValues,
  'newPhotos' | 'photosToDelete' | 'photoVisibility'
> & {
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
  newPhotoPublic: boolean[]
  existingPhotos: PlacePhoto[]
  addPhotos: (files: File[]) => void
  removeNewPhoto: (index: number) => void
  toggleNewPhoto: (index: number) => void
  removeExistingPhoto: (photo: PlacePhoto) => void
  togglePhotoVisibility: (photo: PlacePhoto) => void
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
  const [newPhotoPublic, setNewPhotoPublic] = useState<boolean[]>([])
  const [existingPhotos, setExistingPhotos] = useState<PlacePhoto[]>(
    initialData?.existingPhotos ?? [],
  )
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [photoVisibility, setPhotoVisibility] = useState<Record<string, boolean>>({})

  function addPhotos(files: File[]) {
    setPhotos((prev) => [...prev, ...files])
    setNewPhotoPublic((prev) => [...prev, ...files.map(() => false)])
  }

  function removeNewPhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setNewPhotoPublic((prev) => prev.filter((_, i) => i !== index))
  }

  function toggleNewPhoto(index: number) {
    setNewPhotoPublic((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }

  function removeExistingPhoto(photo: PlacePhoto) {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    setPhotosToDelete((prev) => [...prev, photo.id])
  }

  function togglePhotoVisibility(photo: PlacePhoto) {
    const next = !photo.is_public
    setExistingPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, is_public: next } : p)),
    )
    setPhotoVisibility((prev) => ({ ...prev, [photo.id]: next }))
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
      newPhotos: photos.map((file, i) => ({ file, isPublic: newPhotoPublic[i] ?? false })),
      photosToDelete,
      photoVisibility,
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
    newPhotoPublic,
    existingPhotos,
    addPhotos,
    removeNewPhoto,
    toggleNewPhoto,
    removeExistingPhoto,
    togglePhotoVisibility,
    getValues,
  }
}
