function MapLoadingIndicator() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
      <div className="bg-white/95 rounded-full shadow-md px-4 py-2 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-sm text-slate-700">Lädt Orte...</span>
      </div>
    </div>
  )
}

export default MapLoadingIndicator
