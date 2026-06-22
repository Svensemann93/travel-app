type Props = {
  label?: string
}

function LoadingState({ label = 'Lädt…' }: Props) {
  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label={label}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default LoadingState
