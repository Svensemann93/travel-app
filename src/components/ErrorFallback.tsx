type Props = {
  resetError: () => void
}

function ErrorFallback({ resetError }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Ups, da ist etwas schiefgelaufen.
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Der Fehler wurde automatisch gemeldet. Versuche es erneut oder lade die Seite neu.
        </p>
        <button
          onClick={resetError}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  )
}

export default ErrorFallback
