import { useTranslation } from 'react-i18next'
import PhotoUploader from './PhotoUploader'
import PriceLevel from './PriceLevel'
import StarRating from './StarRating'
import CollapsibleSection from './CollapsibleSection'
import { CATEGORIES } from '../lib/categories'
import type { PlaceFormApi } from '../hooks/usePlaceForm'

type Props = {
  form: PlaceFormApi
  onError: (message: string) => void
}

function PlaceFormFields({ form, onError }: Props) {
  const { t } = useTranslation(['places', 'category'])

  return (
    <>
      <div>
        <label htmlFor="place-name" className="block text-sm font-medium text-slate-700 mb-1">
          {t('form.name')}
        </label>
        <input
          id="place-name"
          type="text"
          value={form.name}
          onChange={(e) => form.setName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          autoFocus
        />
      </div>

      <div>
        <label
          htmlFor="place-description"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {t('form.description')}
        </label>
        <textarea
          id="place-description"
          value={form.description}
          onChange={(e) => form.setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-slate-700 mb-1">{t('form.category')}</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = form.category === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => form.setCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isSelected
                    ? 'border-transparent text-white'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                style={isSelected ? { backgroundColor: cat.color } : undefined}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.9)' : cat.color }}
                />
                {t(`category:${cat.id}`)}
              </button>
            )
          })}
        </div>
      </div>

      <CollapsibleSection title={t('form.visitedOn')}>
        <input
          id="place-visited-on"
          type="date"
          aria-label={t('form.visitedOn')}
          value={form.visitedOn}
          onChange={(e) => form.setVisitedOn(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-slate-500">{t('form.visitedOnHint')}</p>
      </CollapsibleSection>

      <CollapsibleSection title={t('form.rating')}>
        <StarRating value={form.rating} onChange={form.setRating} />
      </CollapsibleSection>

      <CollapsibleSection title={t('form.price')}>
        <PriceLevel value={form.priceLevel} onChange={form.setPriceLevel} />
      </CollapsibleSection>

      <CollapsibleSection title={t('form.website')}>
        <input
          id="place-website"
          type="url"
          aria-label={t('form.website')}
          value={form.websiteUrl}
          onChange={(e) => form.setWebsiteUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </CollapsibleSection>

      <CollapsibleSection title={t('form.photos')}>
        <PhotoUploader
          newPhotos={form.photos}
          existingPhotos={form.existingPhotos}
          onAddNewPhotos={form.addPhotos}
          onRemoveNewPhoto={form.removeNewPhoto}
          onRemoveExistingPhoto={form.removeExistingPhoto}
          onError={onError}
          isPlacePublic={form.isPublic}
          newPhotoPublic={form.newPhotoPublic}
          onToggleNewPhoto={form.toggleNewPhoto}
          onTogglePhotoVisibility={form.togglePhotoVisibility}
        />
      </CollapsibleSection>
    </>
  )
}

export default PlaceFormFields
