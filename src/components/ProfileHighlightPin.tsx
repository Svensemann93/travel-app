import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import { countryName } from '../lib/countryNames'
import type { Place } from '../types/place'

function ProfileHighlightPin({ place }: { place: Place }) {
  const { i18n } = useTranslation()
  const cover = place.photos[0]
  const country = place.country_code ? countryName(place.country_code, i18n.language) : null

  return (
    <Link
      to={`/?focus=${place.id}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 transition-shadow hover:shadow-md"
    >
      {cover ? (
        <SignedImage
          path={cover.thumb_url ?? cover.url}
          alt=""
          className="h-32 w-full object-cover sm:h-40"
        />
      ) : (
        <div className="h-32 w-full bg-gradient-to-b from-sky-100 to-emerald-100 sm:h-40" />
      )}
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-slate-900">{place.name}</p>
        {country && <p className="truncate text-xs text-slate-500">{country}</p>}
      </div>
    </Link>
  )
}

export default ProfileHighlightPin
