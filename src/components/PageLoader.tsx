function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Seite wird geladen"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
      <span className="sr-only">Lädt…</span>
    </div>
  )
}

export default PageLoader
