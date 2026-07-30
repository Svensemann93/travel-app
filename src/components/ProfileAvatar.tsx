import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { profileImageUrl } from '../lib/profileImages'
import ProfileImageControl from './ProfileImageControl'

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

  const username = profile?.username ?? '–'
  const initial = username.charAt(0).toUpperCase()
  const avatarSrc = profile?.avatar_path ? profileImageUrl(profile.avatar_path) : ''
  const position = `${profile?.avatar_focus_x ?? 50}% ${profile?.avatar_focus_y ?? 50}%`

  return (
    <div className="relative h-24 w-24 sm:h-28 sm:w-28">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={t('image.avatarAlt')}
          style={{ objectPosition: position }}
          className="h-full w-full rounded-full object-cover ring-4 ring-white"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#39BBDE] text-3xl font-bold text-white ring-4 ring-white">
          {initial}
        </div>
      )}
      <div className="absolute bottom-0 right-0">
        <ProfileImageControl
          kind="avatar"
          src={avatarSrc}
          focusX={profile?.avatar_focus_x ?? 50}
          focusY={profile?.avatar_focus_y ?? 50}
          hasImage={!!profile?.avatar_path}
          menuLabel={t('image.editAvatar')}
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-200 transition-colors hover:bg-white"
          icon={camera}
        />
      </div>
    </div>
  )
}

export default ProfileAvatar
