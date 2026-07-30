import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFormatDate } from '../hooks/useFormatDate'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { useUploadProfileImage } from '../hooks/useUploadProfileImage'
import { profileImageUrl } from '../lib/profileImages'
import { fallbackCoverPath } from '../lib/tripCoverFallback'
import HeaderMenu from './HeaderMenu'
import InlineEditField from './InlineEditField'
import ImageUploadButton from './ImageUploadButton'
import ProfileAvatar from './ProfileAvatar'

const camera = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

function ProfileHero() {
  const { t } = useTranslation(['profile', 'common'])
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { formatDateLong } = useFormatDate()
  const update = useUpdateProfile()
  const coverUpload = useUploadProfileImage()

  const username = profile?.username ?? '–'
  const name = profile?.display_name?.trim() || username
  const coverSrc = profile?.cover_path
    ? profileImageUrl(profile.cover_path)
    : fallbackCoverPath(profile?.id ?? 'default')

  return (
    <div className="relative rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="relative h-32 overflow-hidden rounded-t-2xl sm:h-40">
        <img src={coverSrc} alt={t('image.coverAlt')} className="h-full w-full object-cover" />
        {coverUpload.isError && (
          <p className="absolute bottom-2 left-3 rounded bg-red-600 px-2 py-1 text-xs text-white">
            {(coverUpload.error as Error).message}
          </p>
        )}
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-2">
        <ImageUploadButton
          onFile={(file) => coverUpload.mutate({ kind: 'cover', file })}
          disabled={coverUpload.isPending}
          ariaLabel={t('image.editCover')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-slate-900 disabled:opacity-50"
        >
          {camera}
        </ImageUploadButton>
        <HeaderMenu
          label={t('common:menu.open')}
          items={[{ label: t('menu.settings'), onClick: () => navigate('/settings') }]}
        />
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-12 sm:-mt-14">
          <ProfileAvatar />
        </div>
        <div className="mt-4">
          <InlineEditField
            value={profile?.display_name ?? ''}
            displayValue={name}
            onSave={(v) => update.mutateAsync({ display_name: v || null })}
            ariaLabel={t('edit.editName')}
            maxLength={50}
            valueClassName="text-3xl font-bold tracking-tight text-slate-900"
          />
          <p className="mt-0.5 text-slate-500">@{username.toLowerCase()}</p>
          <div className="mt-2">
            <InlineEditField
              value={profile?.bio ?? ''}
              onSave={(v) => update.mutateAsync({ bio: v || null })}
              ariaLabel={t('edit.editBio')}
              placeholder={t('edit.bioPlaceholder')}
              multiline
              maxLength={300}
              valueClassName="text-sm text-slate-600"
            />
          </div>
          {profile?.created_at && (
            <p className="mt-2 text-sm text-slate-500">
              {t('hero.memberSince', { date: formatDateLong(profile.created_at) })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileHero
