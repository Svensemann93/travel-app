import { countryName } from './countryNames'

export type Located = {
  country_code: string | null
}

export type CountryGroup<T> = {
  code: string | null
  name: string
  items: T[]
}

export function groupByCountry<T extends Located>(items: T[], lang: string): CountryGroup<T>[] {
  const buckets = new Map<string, T[]>()
  for (const item of items) {
    const key = item.country_code ?? ''
    const bucket = buckets.get(key)
    if (bucket) bucket.push(item)
    else buckets.set(key, [item])
  }

  const groups: CountryGroup<T>[] = []
  for (const [key, bucket] of buckets) {
    groups.push({ code: key || null, name: key ? countryName(key, lang) : '', items: bucket })
  }

  groups.sort((a, b) => {
    if (a.code === null) return 1
    if (b.code === null) return -1
    return a.name.localeCompare(b.name, lang)
  })

  return groups
}
