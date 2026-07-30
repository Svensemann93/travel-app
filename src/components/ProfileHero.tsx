import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useFormatDate } from '../hooks/useFormatDate'

function ProfileHero() {
  const { t } = useTranslation('profile')
  const { profile } = useAuth()
  const { formatDateLong } = useFormatDate()

  const username = profile?.username ?? '-'
  const initial = username.charAt(0).toUpperCase()

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="h-32 bg-gradient-to-r from-[#39BBDE]/25 via-[#39BBDE]/10 to-[#F4C15A]/25 sm:h-40" />
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-12 sm:-mt-14">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#39BBDE] text-3xl font-bold text-white ring-4 ring-white sm:h-28 sm:w-28">
            {initial}
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{username}</h2>
          <p className="mt-0.5 text-slate-500">@{username.toLowerCase()}</p>
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
