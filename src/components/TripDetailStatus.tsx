type Props = {
  isLoading: boolean
  error: Error | null
  isMissing: boolean
}

function TripDetailStatus({ isLoading, error, isMissing }: Props) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-3 h-6 w-1/2 rounded bg-slate-200" />
        <div className="h-4 w-1/3 rounded bg-slate-100" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {error.message}
      </div>
    )
  }
  if (isMissing) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">Trip nicht gefunden.</p>
      </div>
    )
  }
  return null
}

export default TripDetailStatus
