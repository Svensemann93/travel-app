import type { TravelStats } from './travelStats'

export type AchievementId =
  | 'first_place'
  | 'ten_places'
  | 'fifty_places'
  | 'hundred_places'
  | 'places_250'
  | 'places_500'
  | 'explorer'
  | 'hiker'
  | 'foodie'
  | 'nightlife'
  | 'nature'
  | 'sightseer'
  | 'photographer'
  | 'photos_100'
  | 'planner'
  | 'trips_5'
  | 'chronicler'
  | 'journals_5'
  | 'sharer'
  | 'public_20'

type Threshold = {
  id: AchievementId
  icon: string
  ink: string
  target: number
  value: (s: TravelStats) => number
}

const THRESHOLDS: Threshold[] = [
  { id: 'first_place', icon: 'pin', ink: '#0d9488', target: 1, value: (s) => s.placeCount },
  { id: 'ten_places', icon: 'map', ink: '#1d4ed8', target: 10, value: (s) => s.placeCount },
  { id: 'fifty_places', icon: 'globe', ink: '#4338ca', target: 50, value: (s) => s.placeCount },
  { id: 'hundred_places', icon: 'trophy', ink: '#b45309', target: 100, value: (s) => s.placeCount },
  { id: 'places_250', icon: 'medal', ink: '#9333ea', target: 250, value: (s) => s.placeCount },
  { id: 'places_500', icon: 'flag', ink: '#be123c', target: 500, value: (s) => s.placeCount },
  { id: 'explorer', icon: 'compass', ink: '#15803d', target: 8, value: (s) => s.categoriesCovered },
  {
    id: 'hiker',
    icon: 'mountain',
    ink: '#92400e',
    target: 10,
    value: (s) => s.categoryCounts.hiking,
  },
  {
    id: 'foodie',
    icon: 'plate',
    ink: '#b91c1c',
    target: 10,
    value: (s) => s.categoryCounts.restaurant + s.categoryCounts.cafe,
  },
  {
    id: 'nightlife',
    icon: 'glass',
    ink: '#7e22ce',
    target: 10,
    value: (s) => s.categoryCounts.bar,
  },
  { id: 'nature', icon: 'tree', ink: '#166534', target: 10, value: (s) => s.categoryCounts.nature },
  {
    id: 'sightseer',
    icon: 'building',
    ink: '#1d4ed8',
    target: 10,
    value: (s) => s.categoryCounts.sight,
  },
  { id: 'photographer', icon: 'camera', ink: '#7e22ce', target: 25, value: (s) => s.photoCount },
  { id: 'photos_100', icon: 'camera', ink: '#0f766e', target: 100, value: (s) => s.photoCount },
  { id: 'planner', icon: 'suitcase', ink: '#0891b2', target: 1, value: (s) => s.tripCount },
  { id: 'trips_5', icon: 'suitcase', ink: '#c2410c', target: 5, value: (s) => s.tripCount },
  { id: 'chronicler', icon: 'book', ink: '#be123c', target: 1, value: (s) => s.journalCount },
  { id: 'journals_5', icon: 'book', ink: '#4d7c0f', target: 5, value: (s) => s.journalCount },
  { id: 'sharer', icon: 'megaphone', ink: '#0284c7', target: 5, value: (s) => s.publicPlaceCount },
  {
    id: 'public_20',
    icon: 'megaphone',
    ink: '#ca8a04',
    target: 20,
    value: (s) => s.publicPlaceCount,
  },
]

export type Achievement = {
  id: AchievementId
  icon: string
  ink: string
  target: number
  current: (s: TravelStats) => number
  earned: (s: TravelStats) => boolean
}

export const ACHIEVEMENTS: Achievement[] = THRESHOLDS.map((th) => ({
  id: th.id,
  icon: th.icon,
  ink: th.ink,
  target: th.target,
  current: (s) => Math.min(th.value(s), th.target),
  earned: (s) => th.value(s) >= th.target,
}))
