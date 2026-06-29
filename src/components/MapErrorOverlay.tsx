type Props = {
  onRetry: () => void
}

function MapErrorOverlay({ onRetry }: Props) {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
      <div
        className="bg-white/95 rounded-lg shadow-lg px-6 py-4 max-w-md text-center pointer-events-auto"
        role="alert"
      >
        <h3 className="font-semibold text-slate-800 mb-1">Orte konnten nicht geladen werden</h3>
        <p className="text-sm text-slate-600 mb-3">
          Beim Laden deiner Orte ist etwas schiefgelaufen.
        </p>
        <button onClick={onRetry} className="text-sm font-medium text-blue-600 hover:underline">
          Erneut versuchen
        </button>
      </div>
    </div>
  )
}

export default MapErrorOverlay
