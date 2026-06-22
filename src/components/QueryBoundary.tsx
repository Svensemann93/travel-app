import type { ReactNode } from 'react'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'

type Props = {
  isLoading: boolean
  isError: boolean
  error?: Error | null
  isEmpty?: boolean
  onRetry?: () => void
  loading?: ReactNode
  empty?: ReactNode
  children: ReactNode
}

function QueryBoundary({
  isLoading,
  isError,
  error,
  isEmpty,
  onRetry,
  loading,
  empty,
  children,
}: Props) {
  if (isLoading) return <>{loading ?? <LoadingState />}</>
  if (isError) return <ErrorState message={error?.message} onRetry={onRetry} />
  if (isEmpty) return <>{empty}</>
  return <>{children}</>
}

export default QueryBoundary
