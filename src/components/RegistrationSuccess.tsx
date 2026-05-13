import AuthLayout from './AuthLayout'

type Props = {
  email: string
}

function RegistrationSuccess({ email }: Props) {
  return (
    <AuthLayout
      title="E-Mail bestätigen"
      footerText="Bereits bestätigt?"
      footerLinkTo="/login"
      footerLinkLabel="Hier anmelden"
    >
      <div className="text-sm text-slate-700 space-y-3">
        <p>
          Wir haben dir einen Bestätigungs-Link an <strong>{email}</strong> gesendet.
        </p>
        <p>Bitte klicke auf den Link in der Mail, um deine Registrierung abzuschliessen.</p>
        <p className="text-slate-500">Keine Mail erhalten? Prüfe deinen Spam-Ordner.</p>
      </div>
    </AuthLayout>
  )
}

export default RegistrationSuccess
