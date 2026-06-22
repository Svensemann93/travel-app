import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import EmptyState from './EmptyState'

type Props = {
  isLoading: boolean
  error?: Error | null
  isMissing: boolean
  notFoundLabel?: string
  onRetry?: () => void
}

function DetailStatus({
  isLoading,
  error,
  isMissing,
  notFoundLabel = 'Nicht gefunden.',
  onRetry,
}: Props) {
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />
  if (isMissing) return <EmptyState title={notFoundLabel} />
  return null
}

export default DetailStatus
