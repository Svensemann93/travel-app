function MapEmptyState() {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
      <div className="bg-white/95 rounded-lg shadow-lg px-6 py-4 max-w-md text-center">
        <h3 className="font-semibold text-slate-800 mb-1">Willkommen!</h3>
        <p className="text-sm text-slate-600">
          Klicke irgendwo auf die Karte, um deinen ersten Ort hinzuzufügen.
        </p>
      </div>
    </div>
  )
}

export default MapEmptyState
