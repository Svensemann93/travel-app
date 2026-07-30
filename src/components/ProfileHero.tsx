import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFormatDate } from '../hooks/useFormatDate'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import HeaderMenu from './HeaderMenu'
import InlineEditField from './InlineEditField'

function ProfileHero() {
  const { t } = useTranslation(['profile', 'common'])
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { formatDateLong } = useFormatDate()
  const update = useUpdateProfile()

  const username = profile?.username ?? '–'
  const initial = username.charAt(0).toUpperCase()
  const name = profile?.display_name?.trim() || username

  return (
    <div className="relative rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="h-32 rounded-t-2xl bg-gradient-to-r from-[#39BBDE]/25 via-[#39BBDE]/10 to-[#F4C15A]/25 sm:h-40" />

      <div className="absolute right-3 top-3">
        <HeaderMenu
          label={t('common:menu.open')}
          items={[{ label: t('menu.settings'), onClick: () => navigate('/settings') }]}
        />
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-12 sm:-mt-14">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#39BBDE] text-3xl font-bold text-white ring-4 ring-white sm:h-28 sm:w-28">
            {initial}
          </div>
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
