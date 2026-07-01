import { useTranslation, Trans } from 'react-i18next'
import AuthLayout from './AuthLayout'

type Props = {
  email: string
}

function RegistrationSuccess({ email }: Props) {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout
      title={t('success.title')}
      footerText={t('success.footerText')}
      footerLinkTo="/login"
      footerLinkLabel={t('success.footerLink')}
    >
      <div className="text-sm text-slate-700 space-y-3">
        <p>
          <Trans i18nKey="success.sentTo" ns="auth" values={{ email }}>
            Wir haben dir einen Bestätigungs-Link an <strong>{email}</strong> gesendet.
          </Trans>
        </p>
        <p>{t('success.instruction')}</p>
        <p className="text-slate-500">{t('success.spamHint')}</p>
      </div>
    </AuthLayout>
  )
}

export default RegistrationSuccess
