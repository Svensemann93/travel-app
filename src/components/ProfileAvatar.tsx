import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useUploadProfileImage } from '../hooks/useUploadProfileImage'
import { profileImageUrl } from '../lib/profileImages'
import ImageUploadButton from './ImageUploadButton'

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

function ProfileAvatar() {
  const { t } = useTranslation('profile')
  const { profile } = useAuth()
  const upload = useUploadProfileImage()

  const username = profile?.username ?? '–'
  const initial = username.charAt(0).toUpperCase()

  return (
    <div>
      <div className="relative h-24 w-24 sm:h-28 sm:w-28">
        {profile?.avatar_path ? (
          <img
            src={profileImageUrl(profile.avatar_path)}
            alt={t('image.avatarAlt')}
            className="h-full w-full rounded-full object-cover ring-4 ring-white"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#39BBDE] text-3xl font-bold text-white ring-4 ring-white">
            {initial}
          </div>
        )}
        <ImageUploadButton
          onFile={(file) => upload.mutate({ kind: 'avatar', file })}
          disabled={upload.isPending}
          ariaLabel={t('image.editAvatar')}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-200 transition-colors hover:text-slate-900 disabled:opacity-50"
        >
          {camera}
        </ImageUploadButton>
      </div>
      {upload.isError && (
        <p className="mt-1 text-xs text-red-600">{(upload.error as Error).message}</p>
      )}
    </div>
  )
}

export default ProfileAvatar
